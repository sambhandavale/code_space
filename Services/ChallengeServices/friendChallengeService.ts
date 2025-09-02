import UserChallengesModel from "../../Models/Challenges/User-Challenges";
import Question from "../../Models/Challenges/Question";
import UserStats from "../../Models/Users/UserStats";
import moment from "moment";
import { updateChallengeStreak } from "../../Utility/Challenge/updateStreak";
import { updateUserFavorites } from "../../Utility/User/updateFavourites";
import UserModel from "../../Models/Users/Users";
import mongoose from "mongoose";

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export class PrivateChallengeService {
    // Create a private challenge with a room code
    static async createPrivateChallenge(userId: string, language: string, timeControl: number) {
        const roomCode = generateRoomCode();

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
        if (!problem.length) throw new Error("No problem found for difficulty");

        const player = await UserModel.findById(userId).select(
        "email username first_name last_name"
        );
        if (!player) throw new Error("User not found");

        const challenge = await UserChallengesModel.create({
        players: [
            {
            user_id: player._id,
            email: player.email,
            username: player.username,
            full_name: `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim(),
            },
        ],
        language,
        time: timeControl,
        problem_id: problem[0]._id,
        room_code: roomCode,
        is_private: true,
        status: "waiting",
        winner: null,
        rating_change: {},
        });

        return { roomCode, challengeId: challenge._id };
    }

    // Join a private challenge room by code
    static async joinPrivateChallenge(userId: string, roomCode: string, timezone: string) {
        const challenge = await UserChallengesModel.findOne({ room_code: roomCode });

        if (!challenge || challenge.status !== "waiting") {
        throw new Error("Room not found or already started");
        }

        if (challenge.players.length >= 2) {
        throw new Error("Room is full");
        }

        const player = await UserModel.findById(userId).select(
        "email username first_name last_name"
        );
        if (!player) throw new Error("User not found");

        challenge.players.push({
        user_id: new mongoose.Types.ObjectId(player._id.toString()),
        email: player.email,
        username: player.username,
        full_name: `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim(),
        });
        challenge.status = "active";
        challenge.start_time = new Date();
        await challenge.save();

        const today = moment().format("YYYY-MM-DD");

        await Promise.all([
        UserStats.findOneAndUpdate(
            { user_id: userId },
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
            { user_id: challenge.players[0].user_id },
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
        updateChallengeStreak(userId, timezone),
        updateChallengeStreak(challenge.players[0].user_id.toString(), timezone),
        updateUserFavorites(userId),
        updateUserFavorites(challenge.players[0].user_id.toString()),
        ]);

        return { challengeId: challenge._id };
    }

    // Check room status (active, waiting, stale)
    static async checkRoomStatus(roomCode: string) {
        const challenge = await UserChallengesModel.findOne({ room_code: roomCode });
        if (!challenge) throw new Error("Room not found");

        const createdAt = challenge["createdAt"];
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / 60000;

        const MAX_WAIT_MINUTES = 5;

        if (challenge.status === "waiting" && diffMinutes > MAX_WAIT_MINUTES) {
        challenge.status = "stale";
        challenge.active = false;
        await challenge.save();

        return { expired: true, status: "stale" };
        }

        return { status: challenge.status, challengeId: challenge._id };
    }
}
