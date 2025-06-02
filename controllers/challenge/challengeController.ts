import { Request, Response } from "express";
import MatchMaking from "../../models/Challenges/MatchMaking";
import UserChallenges from "../../models/Challenges/User-Challenges";
import Question from "../../models/Challenges/Question";
import mongoose from "mongoose";
import { io } from "../../App";
import { userSockets } from "../../App";  
import UserDetails from "../../models/Users/UserDetails";
import { getAll } from "../../utility/handlerFactory";
import { updateStreak } from "../../utility/Challenge/updateStreak";
import moment from "moment";
import { IBaseRequest } from "../../interfaces/core_interfaces";
import MatchMakingModel from "../../models/Challenges/MatchMaking";
import UserChallengesModel from "../../models/Challenges/User-Challenges";

/*
Note: Message code meaning -
10: Got all right u---won,
11: Opponent got all answers right---lost,
30: Opponent left---won,
31: You left---lost,
40: Draw
*/

export const getAllChallenges = getAll(UserChallenges); 

export const joinMatchmaking = async (req:Request, res:Response) => {
    try {
        const {userId, language, timeControl } = req.body;

        const existingChallenge = await UserChallengesModel.findOne({
            players: userId,
            active: true,
        });

        if(existingChallenge){
            res.status(400).json({ message: "Already in a challenge", challengeId: existingChallenge._id });
            return;
        }

        // Check if user is already in matchmaking
        const existingMatch = await MatchMaking.findOne({ user_id: userId });

        if (!existingMatch) {
            await MatchMaking.create({ user_id: userId, language, time_control: timeControl });
        }

        // Try to find a match
        const opponent = await MatchMaking.findOne({
            language,
            time_control: timeControl,
            user_id: { $ne: userId },
        });

        if (opponent) {
            createChallenge(userId, opponent.user_id, language, timeControl);
        }

        res.status(200).json({ message: "Searching for a match..." });
    } catch (error) {
        console.error("Error joining matchmaking:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const createChallenge = async (player1Id: mongoose.Schema.Types.ObjectId, player2Id: mongoose.Schema.Types.ObjectId, language: string, timeControl: number) => {
    try {
        await MatchMaking.deleteMany({ user_id: { $in: [player1Id, player2Id] } });

        const difficultyMap: Record<number, string> = {
            5: "Easy",
            10: "Medium",
            20: "Hard",
        };

        const difficulty = difficultyMap[timeControl]

        const problem = await Question.aggregate([
            { $match: { difficulty } },
            { $sample: { size: 1 } }
        ]);
        
        const problemId = problem[0]._id;

        const challenge = await UserChallenges.create({
            players: [player1Id, player2Id],
            language,
            time: timeControl,
            problem_id: problemId,
            winner: null,
            rating_change: {},
        });

        // await UserDetails.updateMany(
        //     { user_id: { $in: [player1Id, player2Id] } },
        //     { $inc: { matches_played: 1 } }
        // );

        await Promise.all([updateStreak(player1Id.toString()), updateStreak(player2Id.toString())]);

        const today = moment().format("YYYY-MM-DD");

        await Promise.all([
            UserDetails.findOneAndUpdate(
                { user_id: player1Id },
                {
                    $inc: {
                        matches_played: 1,
                        [`daily_matches.${today}.count`]: 1, // Increment match count for today
                    },
                    $push: {
                        [`daily_matches.${today}.challenges`]: challenge._id, // Store challenge ID
                    },
                },
                { upsert: true, new: true }
            ),
            UserDetails.findOneAndUpdate(
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
        

        const player1SocketId = userSockets.get(player1Id.toString());
        const player2SocketId = userSockets.get(player2Id.toString());
        
        if (player1SocketId) {
            io.to(player1SocketId).emit("match_found", { challengeId: challenge._id, opponentId: player2Id });
        }
        if (player2SocketId) {
            io.to(player2SocketId).emit("match_found", { challengeId: challenge._id, opponentId: player1Id });
        }

    } catch (error) {
        console.error("Error creating challenge:", error);
    }
};

export const getChallengeStatus = async (req: Request, res: Response) => {
    try {
        const { challengeId } = req.params;
        const challenge = await UserChallenges.findById(challengeId);

        if (!challenge) {
            res.status(404).json({ error: 'Challenge not found' });
            return;
        }

        const now = new Date();
        const elapsed = (now.getTime() - challenge.start_time.getTime()) / 1000;
        const total = challenge.time * 60;
        const remaining = Math.max(total - elapsed, 0);

        res.status(200).json({
            challengeId: challenge._id,
            remainingTime: remaining,
            problemId: challenge.problem_id,
            players: challenge.players,
        });
        return;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};

export const leaveMatchmaking = async (req:Request, res:Response) => {
    try {
        const { userId } = req.body;

        // Remove user from matchmaking queue
        await MatchMaking.deleteOne({ user_id: userId });

        res.status(200).json({ message: "Left matchmaking successfully." });
    } catch (error) {
        console.error("Error leaving matchmaking:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const leaveChallenge = async (req:Request, res:Response) => {
    try {
        const { challengeId, userId } = req.body;

        const challenge = await UserChallenges.findById(challengeId);

        if (!challenge) {
            res.status(404).json({ message: "Challenge not found" });
            return;
        }

        if (!challenge.active) {
            res.status(400).json({ message: "Challenge is already ended." });
            return;
        }

        const problem = await Question.findById(challenge.problem_id).select("difficulty");

        if (!problem) {
            res.status(404).json({ message: "Problem not found" });
            return;
        }

        // determine the winner
        const [player1, player2] = challenge.players;
        const winnerId = player1.toString() === userId ? player2 : player1;

        const ratingChange = problem.difficulty === "Easy" ? 6 
                           : problem.difficulty === "Medium" ? 8 
                           : 10;

        const winnerIdStr = winnerId.toString();
        const userIdStr = userId.toString();

        // Update challenge with winner and deactivate it
        await UserChallenges.findByIdAndUpdate(challengeId, {
            winner: winnerId,
            rating_change: { [winnerIdStr]: ratingChange, [userIdStr]: -ratingChange },
            active: false
        });

        await Promise.all([
            UserDetails.findOneAndUpdate(
                { user_id: winnerId },
                { $inc: { rating: ratingChange, wins: 1 } }
            ),
            UserDetails.findOneAndUpdate(
                { user_id: userId },
                { $inc: { rating: -ratingChange, loss: 1 } }
            )
        ]);

        const winnerSocketId = userSockets.get(winnerIdStr);
        const loserSocketId = userSockets.get(userIdStr);

        if (winnerSocketId) {
            io.to(winnerSocketId).emit("match_result", {
                code:30,
                message: "Your opponent left the match! You win! 🎉",
                ratingChange
            });
        }
        if (loserSocketId) {
            io.to(loserSocketId).emit("match_result", {
                code:31,
                message: "You left the match. Your opponent wins by default. ❌",
                ratingChange: -ratingChange
            });
        }

        res.status(200).json({ message: "Match forfeited. Opponent declared winner." });

    } catch (error) {
        console.error("Error handling early challenge exit:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const drawChallenge = async (req:Request, res:Response) => {
    try {
        const { challengeId } = req.body;

        const challenge = await UserChallenges.findById(challengeId);

        if (!challenge) {
            res.status(404).json({ message: "Challenge not found" });
            return;
        }

        if (!challenge.active) {
            res.status(400).json({ message: "Challenge already ended." });
            return;
        }

        const problem = await Question.findById(challenge.problem_id).select("difficulty");
        if (!problem) {
            res.status(404).json({ message: "Problem not found" });
            return;
        }

        const [player1, player2] = challenge.players;
        const player1Str = player1.toString();
        const player2Str = player2.toString();

        const fullRating = problem.difficulty === "Easy" ? 6
                          : problem.difficulty === "Medium" ? 8
                          : 10;

        const drawRating = Math.floor(fullRating / 2); // 3, 4, or 5

        await UserChallenges.findByIdAndUpdate(challengeId, {
            winner: null,
            rating_change: { [player1Str]: drawRating, [player2Str]: drawRating },
            active: false,
            draw: true,
        });

        await Promise.all([
            UserDetails.findOneAndUpdate(
                { user_id: player1 },
                { $inc: { rating: drawRating, draws: 1 } }
            ),
            UserDetails.findOneAndUpdate(
                { user_id: player2 },
                { $inc: { rating: drawRating, draws: 1 } }
            )
        ]);

        const socket1 = userSockets.get(player1Str);
        const socket2 = userSockets.get(player2Str);

        if (socket1) {
            io.to(socket1).emit("match_result", {
                code:40,
                message: "The match ended in a draw! 🤝",
                ratingChange: drawRating
            });
        }

        if (socket2) {
            io.to(socket2).emit("match_result", {
                code:40,
                message: "The match ended in a draw! 🤝",
                ratingChange: drawRating
            });
        }

        res.status(200).json({ message: "Match ended in a draw. Ratings updated." });

    } catch (error) {
        console.error("Error handling draw:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const submitChallengeResult = async (req:Request, res:Response) => {
    try {
        const { challengeId, winnerId, ratingChanges } = req.body;

        // Convert ratingChanges to an array to get [winnerRating, loserRating]
        const ratingValues = Object.values(ratingChanges);

        if (ratingValues.length !== 2) {
            res.status(400).json({ error: "Invalid ratingChanges format. Expected 2 values." });
            return;
        }

        const winnerRatingChange = ratingValues[0]  as number;
        const loserRatingChange = ratingValues[1]  as number;

        // Fetch challenge to find participants
        const challenge = await UserChallenges.findById(challengeId);
        if (!challenge) {
            res.status(404).json({ error: "Challenge not found." });
            return;
        }

        const participants: string[] = challenge.players.map(player => player.toString());

        // Identify loser ID
        const loserId = participants.find((id) => id !== winnerId);
        if (!loserId) {
            res.status(400).json({ error: "Could not determine loser from participants." });
            return;
        }

        // Update challenge result
        await UserChallenges.findByIdAndUpdate(challengeId, {
            winner: winnerId,
            rating_change: {
                [winnerId]: winnerRatingChange,
                [loserId]: loserRatingChange,
            },
            active: false,
        });

        await Promise.all([
            UserDetails.findOneAndUpdate(
                { user_id: winnerId },
                {
                    $inc: {
                        rating: winnerRatingChange,
                        wins: 1,
                        matches_played: 1,
                    },
                    $set: { last_match_date: new Date() }
                }
            ),
            UserDetails.findOneAndUpdate(
                { user_id: loserId },
                {
                    $inc: {
                        rating: loserRatingChange,
                        loss: 1,
                        matches_played: 1,
                    },
                    $set: { last_match_date: new Date() }
                }
            )
        ]);

        // Notify both users via socket
        const notifyUser = (userId: string, isWinner: boolean, ratingChange: number) => {
            const socketId = userSockets.get(userId);
            if (socketId) {
                io.to(socketId).emit("match_result", {
                    code: isWinner ? 10 : 11,
                    message: isWinner
                        ? "You won the match! 🎉"
                        : "You lost the match. Better luck next time! 💪",
                    ratingChange
                });
            }
        };

        notifyUser(winnerId, true, winnerRatingChange);
        notifyUser(loserId, false, loserRatingChange);

        res.status(200).json({ message: "Challenge result submitted and ratings updated." });

    } catch (error) {
        console.error("Error submitting challenge result:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getChallengeById = async (req:Request, res:Response) => {
    try {
        const challenge = await UserChallenges.findById(req.params.id).populate({
            path: "players",
            model: "User",
            select: "first_name last_name user_photo username role",
        }).populate({
            path: "problem_id",
            model: "Question",
        });

        if (!challenge) {
            res.status(404).json({ message: "Challenge not found" });
            return;
        }

        const playerDetails = await UserDetails.find({ user_id: { $in: challenge.players } })
            .select("user_id matches_played rating wins draw loss");

        res.status(200).json({
            ...challenge.toObject(),
            playerDetails,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const proxyPythonTestCaseCompiler = async (req: Request, res: Response) => {
    try {
        const response = await fetch("https://python-compiler-mu.vercel.app/api/test-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        const result = await response.json();
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in proxyPythonCompiler:", error);
        res.status(500).json({ error: "Failed to proxy request" });
    }
};

export const proxyPythonCompiler = async (req: Request, res: Response) => {
    try {
        const response = await fetch("https://python-compiler-mu.vercel.app/api/test-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        const result = await response.json();
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in proxyPythonCompiler:", error);
        res.status(500).json({ error: "Failed to proxy request" });
    }
};
