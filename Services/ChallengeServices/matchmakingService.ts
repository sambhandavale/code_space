import MatchMaking from "../../Models/Challenges/MatchMaking";
import UserChallenges from "../../Models/Challenges/User-Challenges";
import Question from "../../Models/Challenges/Question";
import mongoose from "mongoose";
import moment from "moment";
import UserStats from "../../Models/Users/UserStats";
import UserChallengesModel from "../../Models/Challenges/User-Challenges";
import UserModel from "../../Models/Users/Users";
import { updateChallengeStreak } from "../../Utility/Challenge/updateStreak";
import { updateUserFavorites } from "../../Utility/User/updateFavourites";
import { emitToUser } from "../../Controllers/Challenge/challengeController";

export class MatchmakingService {
    // Add user to matchmaking queue or match them with an opponent
    static async joinMatchmaking(
        userId: any,
        language: string,
        timeControl: number,
        timezone: string
    ) {
        let existingChallenge = await UserChallengesModel.findOne({
            "players.user_id": userId,
            active: true,
        });

        if (existingChallenge) {
            if (existingChallenge.is_private) {

                if (existingChallenge.status === "waiting") {
                    return {
                        alreadyInPrivateWaiting: true,
                        challengeId: existingChallenge._id,
                        message: "You are already waiting for a private match.",
                    };
                }

                const createdAt = existingChallenge.createdAt as Date;
                const diffMinutes =
                    (Date.now() - createdAt.getTime()) / (1000 * 60);

                if (diffMinutes > 5) {
                    existingChallenge.active = false;
                    existingChallenge.status = "stale";
                    await existingChallenge.save();

                    existingChallenge = null;
                }
            }

            if (existingChallenge) {
                return {
                    alreadyInChallenge: true,
                    challengeId: existingChallenge._id,
                };
            }
        }

        const existingMatch = await MatchMaking.findOne({ user_id: userId });
        if (!existingMatch) {
            await MatchMaking.create({
                user_id: userId,
                language,
                time_control: timeControl,
            });
        }

        const opponent = await MatchMaking.findOne({
            time_control: timeControl,
            user_id: { $ne: userId },
        });

        if (opponent) {
            await this.createChallenge(
                userId,
                opponent.user_id,
                language,
                timeControl,
                timezone
            );
            return { matchFound: true };
        }

        return { matchFound: false };
    }

    // Remove user from matchmaking queue
    static async leaveMatchmaking(userId: string) {
        await MatchMaking.deleteOne({ user_id: userId });
    }

    // Core challenge creation logic
    private static async createChallenge(
        player1Id: mongoose.Schema.Types.ObjectId,
        player2Id: mongoose.Schema.Types.ObjectId,
        language: string,
        timeControl: number,
        timezone: string
    ) {
        await MatchMaking.deleteMany({ user_id: { $in: [player1Id, player2Id] } });

        const difficultyMap: Record<number, string> = {
        5: "Easy",
        10: "Medium",
        20: "Hard",
        };
        const difficulty = difficultyMap[timeControl];

        const problem = await Question.aggregate([
        { $match: { difficulty, approved: true } },
        { $sample: { size: 1 } },
        ]);
        const problemId = problem[0]._id;

        const [player1, player2] = await Promise.all([
        UserModel.findById(player1Id).select("email username first_name last_name"),
        UserModel.findById(player2Id).select("email username first_name last_name"),
        ]);

        if (!player1 || !player2) throw new Error("One or both players not found.");

        const challenge = await UserChallenges.create({
        players: [
            {
            user_id: player1Id,
            email: player1.email,
            username: player1.username,
            full_name: `${player1.first_name ?? ""} ${player1.last_name ?? ""}`.trim(),
            },
            {
            user_id: player2Id,
            email: player2.email,
            username: player2.username,
            full_name: `${player2.first_name ?? ""} ${player2.last_name ?? ""}`.trim(),
            },
        ],
        language,
        time: timeControl,
        problem_id: problemId,
        winner: null,
        rating_change: {},
        start_time: new Date(),
        status: "active",
        });

        // update streaks
        await Promise.all([
        updateChallengeStreak(player1Id.toString(), timezone),
        updateChallengeStreak(player2Id.toString(), timezone),
        ]);

        const today = moment().format("YYYY-MM-DD");

        // update user stats
        await Promise.all([
        UserStats.findOneAndUpdate(
            { user_id: player1Id },
            {
            $inc: {
                matches_played: 1,
                [`daily_matches.${today}.count`]: 1,
            },
            $push: {
                [`daily_matches.${today}.challenges`]: challenge._id,
            },
            },
            { upsert: true, new: true }
        ),
        UserStats.findOneAndUpdate(
            { user_id: player2Id },
            {
            $inc: {
                matches_played: 1,
                [`daily_matches.${today}.count`]: 1,
            },
            $push: {
                [`daily_matches.${today}.challenges`]: challenge._id,
            },
            },
            { upsert: true, new: true }
        ),
        ]);

        await updateUserFavorites(player1Id.toString());
        await updateUserFavorites(player2Id.toString());

        // notify players via socket
        emitToUser(player1Id.toString(), "match_found", {
        challengeId: challenge._id,
        opponentId: player2Id,
        });
        emitToUser(player2Id.toString(), "match_found", {
        challengeId: challenge._id,
        opponentId: player1Id,
        });
    }
}
