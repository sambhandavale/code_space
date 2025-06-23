import { Request, Response } from "express";
import MatchMaking from "../../models/Challenges/MatchMaking";
import UserChallenges from "../../models/Challenges/User-Challenges";
import Question from "../../models/Challenges/Question";
import mongoose from "mongoose";
import { io } from "../../App";
import { userSockets } from "../../App";  
import UserStats from "../../models/Users/UserStats";
import { getAll } from "../../utility/handlerFactory";
import moment from "moment";
import { IBaseRequest } from "../../interfaces/core_interfaces";
import UserChallengesModel from "../../models/Challenges/User-Challenges";
import { updateUserTitleByRating } from "../../utility/User/updateUserTitle";
import { updateChallengeStreak } from "../../utility/Challenge/updateStreak";
import { updateUserFavorites } from "../../utility/User/updateFavourites";
import UserModel from "../../models/Users/Users";

interface TestResult{
  actual: string;
  output: string;
  input: string;
  status: "PASSED" | "FAILED" | string;
  test_case: number;
};

/*
Note: Message code meaning -
10: Got all right u---won,
11: Opponent got all answers right---lost,
30: Opponent left---won,
31: You left---lost,
40: Draw
*/

const emitToUser = (userId: string, event: string, data: any) => {
    const socketIds = userSockets.get(userId);
    if (socketIds && socketIds.size > 0) {
        socketIds.forEach(socketId => {
            io.to(socketId).emit(event, data);
        });
    }
};


export const getAllChallenges = getAll(UserChallenges); 

export const joinMatchmaking = async (req:Request, res:Response) => {
    try {
        const {userId, language, timeControl } = req.body;
        const timezone = req.headers['x-user-timezone'] as string;

        const existingChallenge = await UserChallengesModel.findOne({
            "players.user_id": userId,
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
            // language, // initally removing language criteria
            time_control: timeControl,
            user_id: { $ne: userId },
        });

        if (opponent) {
            createChallenge(userId, opponent.user_id, language, timeControl,timezone);
        }

        res.status(200).json({ message: "Searching for a match..." });
    } catch (error) {
        console.error("Error joining matchmaking:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const createChallenge = async (player1Id: mongoose.Schema.Types.ObjectId, player2Id: mongoose.Schema.Types.ObjectId, language: string, timeControl: number, timezone:string) => {
    try {
        await MatchMaking.deleteMany({ user_id: { $in: [player1Id, player2Id] } });

        const difficultyMap: Record<number, string> = {
            5: "Easy",
            10: "Medium",
            20: "Hard",
        };

        const difficulty = difficultyMap[timeControl]

        const problem = await Question.aggregate([
            { $match: { difficulty, approved: true } },
            { $sample: { size: 1 } }
        ]);

        
        const problemId = problem[0]._id;

        const [player1, player2] = await Promise.all([
            UserModel.findById(player1Id).select('email username first_name last_name'),
            UserModel.findById(player2Id).select('email username first_name last_name')
        ]);

        if (!player1 || !player2) throw new Error("One or both players not found.");

        const challenge = await UserChallenges.create({
            players: [
                {
                    user_id: player1Id,
                    email: player1.email,
                    username: player1.username,
                    full_name: `${player1.first_name ?? ""} ${player1.last_name ?? ""}`.trim()
                },
                {
                    user_id: player2Id,
                    email: player2.email,
                    username: player2.username,
                    full_name: `${player2.first_name ?? ""} ${player2.last_name ?? ""}`.trim()
                }
            ],
            language,
            time: timeControl,
            problem_id: problemId,
            winner: null,
            rating_change: {},
            start_time: new Date(),
            status: 'active',
        });


        // await UserStats.updateMany(
        //     { user_id: { $in: [player1Id, player2Id] } },
        //     { $inc: { matches_played: 1 } }
        // );

        await Promise.all([updateChallengeStreak(player1Id.toString(),timezone), updateChallengeStreak(player2Id.toString(),timezone)]);

        const today = moment().format("YYYY-MM-DD");

        await Promise.all([
            UserStats.findOneAndUpdate(
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
        

        const player1SocketId = userSockets.get(player1Id.toString());
        const player2SocketId = userSockets.get(player2Id.toString());
        
        emitToUser(player1Id.toString(), "match_found", { challengeId: challenge._id, opponentId: player2Id });
        emitToUser(player2Id.toString(), "match_found", { challengeId: challenge._id, opponentId: player1Id });

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
        const winnerId = player1.user_id.toString() === userId ? player2.user_id : player1.user_id;

        const ratingChange = problem.difficulty === "Easy" ? 6 
                           : problem.difficulty === "Medium" ? 8 
                           : 10;

        const winnerIdStr = winnerId.toString();
        const userIdStr = userId.toString();

        // Update challenge with winner and deactivate it
        await UserChallenges.findByIdAndUpdate(challengeId, {
            winner: winnerId,
            rating_change: { [winnerIdStr]: ratingChange, [userIdStr]: -ratingChange },
            active: false,
            status:'completed'
        });

        const winnerStats = await UserStats.findOne({ user_id: winnerId }).select('rating');
        const currentWinnerRating = winnerStats?.rating || 0

        await Promise.all([
            UserStats.findOneAndUpdate(
                { user_id: winnerId },
                { 
                    $inc: { rating: ratingChange, wins: 1 },
                    $max: { highest_rating: currentWinnerRating + ratingChange }
                }
                
            ),
            UserStats.findOneAndUpdate(
                { user_id: userId },
                { $inc: { rating: -ratingChange, loss: 1 } }
            )
        ]);

        emitToUser(winnerIdStr, "match_result", {
            code: 30,
            message: "Your opponent left the match! You win! 🎉",
            ratingChange
        });

        emitToUser(userIdStr, "match_result", {
            code: 31,
            message: "You left the match. Your opponent wins by default. ❌",
            ratingChange: -ratingChange
        });

        await updateUserTitleByRating(winnerIdStr);
        await updateUserTitleByRating(userIdStr);

        res.status(200).json({ message: "Match forfeited. Opponent declared winner." });

    } catch (error) {
        console.error("Error handling early challenge exit:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const acceptDrawChallenge = async (req: Request, res: Response) => {
    try {
        const { challengeId } = req.body;
        const { timeup } = req.query;  // Capture timeup from query

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
        const player1Str = player1.user_id.toString();
        const player2Str = player2.user_id.toString();

        const fullRating = problem.difficulty === "Easy" ? 6
            : problem.difficulty === "Medium" ? 8
            : 10;

        const drawRating = Math.floor(fullRating / 2); // 3, 4, or 5

        // If timeup, rating change is zero
        const finalDrawRating = timeup ? 0 : drawRating;

        await UserChallenges.findByIdAndUpdate(challengeId, {
            winner: null,
            rating_change: { [player1Str]: finalDrawRating, [player2Str]: finalDrawRating },
            active: false,
            draw: true,
        });

        if (!timeup) {
            const [player1Stats, player2Stats] = await Promise.all([
                UserStats.findOne({ user_id: player1Str }),
                UserStats.findOne({ user_id: player2Str })
            ]);

            await Promise.all([
                UserStats.findOneAndUpdate(
                    { user_id: player1Str },
                    {
                        $inc: { rating: drawRating, draws: 1 },
                        $max: { highest_rating: (player1Stats?.rating || 0) + drawRating }
                    }
                ),
                UserStats.findOneAndUpdate(
                    { user_id: player2Str },
                    {
                        $inc: { rating: drawRating, draws: 1 },
                        $max: { highest_rating: (player2Stats?.rating || 0) + drawRating }
                    }
                )
            ]);

            await updateUserTitleByRating(player1Str);
            await updateUserTitleByRating(player2Str);
        }

        emitToUser(player1Str, "match_result", {
            code: 40,
            message: timeup ? "The match ended in a draw due to time up! ⏱️" : "The match ended in a draw! 🤝",
            ratingChange: finalDrawRating
        });

        emitToUser(player2Str, "match_result", {
            code: 40,
            message: timeup ? "The match ended in a draw due to time up! ⏱️" : "The match ended in a draw! 🤝",
            ratingChange: finalDrawRating
        });

        res.status(200).json({
            message: timeup ? "Match ended in a draw due to time up. No ratings updated." : "Match ended in a draw. Ratings updated."
        });

    } catch (error) {
        console.error("Error handling draw:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const askDrawChallenge = async (req: Request, res: Response) => {
    try {
        const { challengeId, userId } = req.body;

        const challenge = await UserChallenges.findById(challengeId);

        if (!challenge) {
            res.status(404).json({ message: "Challenge not found" });
            return;
        }

        if (!challenge.active) {
            res.status(400).json({ message: "Challenge already ended." });
            return;
        }

        const [player1, player2] = challenge.players;
        const player1Str = player1.user_id.toString();
        const player2Str = player2.user_id.toString();

        const opponentId = userId === player1Str ? player2Str : player1Str;
        const opponentSocket = userSockets.get(opponentId);

        emitToUser(opponentId, "ask_draw", {
            code: 41,
            message: "Opponent is asking for a draw"
        });

        res.status(200).json({ message: "Draw request sent to opponent." });
        return

    } catch (error) {
        console.error("Error handling draw:", error);
        
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};

export const rejectDrawChallenge = async (req: Request, res: Response) => {
    try {
        const { challengeId, userId } = req.body;

        const challenge = await UserChallenges.findById(challengeId);

        if (!challenge) {
            res.status(404).json({ message: "Challenge not found" });
            return;
        }

        if (!challenge.active) {
            res.status(400).json({ message: "Challenge already ended." });
            return;
        }

        const [player1, player2] = challenge.players;
        const player1Str = player1.user_id.toString();
        const player2Str = player2.user_id.toString();

        const opponentId = userId === player1Str ? player2Str : player1Str;
        const opponentSocket = userSockets.get(opponentId);

        emitToUser(opponentId, "reject_draw", {
            code: 41,
            message: "Opponent has rejected the draw request",
        });

        res.status(200).json({ message: "Draw rejected" });
        return

    } catch (error) {
        console.error("Error handling draw:", error);
        
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};

export const submitChallengeResult = async (req:Request, res:Response) => {
    try {
        const { challengeId, winnerId, ratingChanges, winnerCode, testcases } = req.body;

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

        const participants: string[] = challenge.players.map(player => player.user_id.toString());

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
            status:'completed',
            $push: {
                codes: {
                    user_id: winnerId,
                    code: winnerCode,
                    passed_test_cases: testcases
                }
            }
        });

        const winnerStats = await UserStats.findOne({ user_id: winnerId }).select('rating');
        const currentWinnerRating = winnerStats?.rating || 0

        await Promise.all([
            UserStats.findOneAndUpdate(
                { user_id: winnerId },
                {
                    $inc: {
                        rating: winnerRatingChange,
                        wins: 1,
                        matches_played: 1,
                    },
                    $set: { last_match_date: new Date() },
                    $max: { highest_rating: (winnerStats?.rating || 0) + winnerRatingChange }
                }
            ),
            UserStats.findOneAndUpdate(
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

        const notifyUser = (userId: string, isWinner: boolean, ratingChange: number) => {
            emitToUser(userId, "match_result", {
                code: isWinner ? 10 : 11,
                message: isWinner
                    ? "You won the match! 🎉"
                    : "You lost the match. Better luck next time! 💪",
                ratingChange
            });
        };


        notifyUser(winnerId, true, winnerRatingChange);
        notifyUser(loserId, false, loserRatingChange);

        await updateUserTitleByRating(winnerId);
        await updateUserTitleByRating(loserId);
        res.status(200).json({ message: "Challenge result submitted and ratings updated." });

    } catch (error) {
        console.error("Error submitting challenge result:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getChallengeById = async (req:Request, res:Response) => {
    try {
        const challenge = await UserChallenges.findById(req.params.id).populate({
            path: "problem_id",
            model: "Question",
        });

        if (!challenge) {
            res.status(404).json({ message: "Challenge not found" });
            return;
        }

        const playerIds = challenge.players.map(player => player.user_id);

        const playerDetails = await UserStats.find({ user_id: { $in: playerIds } })
            .select("user_id matches_played rating wins draw loss")
            .populate({
                path: 'user_id',
                select: 'username email profileImage first_name last_name user_photo'
            });

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const runCodeWithTestCases = async (req: Request, res: Response) => {
    const language = req.body.language;
    const version = req.body.version;
    const userCode = req.body.user_code;
    const testCases = [...req.body.test_cases];
    const ext = req.body.extension;

    const results: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
        const { input, output } = testCases[i];
        const trimmedExpectedOutput = String(output).trim();

        let actualOutput = '';
        let status = 'FAILED';
        let success = false;

        for (let attempt = 0; attempt < 2 && !success; attempt++) {
            const body = {
                language,
                version,
                files: [{ name: `main.${ext}`, content: userCode }],
                stdin: input + '\n',
                args: [],
                compile_timeout: 10000,
                run_timeout: 3000,
            };

            try {
                const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                const text = await response.text();
                let data: any;

                try {
                    data = JSON.parse(text);
                } catch (err) {
                    console.warn(`Attempt ${attempt + 1}: Invalid JSON, retrying...`);
                    await sleep(250);
                    continue;
                }

                actualOutput = data?.run?.output?.trim() ?? '';
                status = actualOutput === trimmedExpectedOutput ? "PASSED" : "FAILED";

                results.push({
                    test_case: i + 1,
                    input,
                    output: trimmedExpectedOutput,
                    actual: actualOutput,
                    status,
                });

                success = true;
            } catch (err) {
                console.warn(`Attempt ${attempt + 1}: Request failed, retrying...`);
                await sleep(250);
            }

            await sleep(250); // Always wait to avoid hitting rate limits
        }

        // If all retries fail (i.e., invalid JSON every time), mark failed with empty output
        if (!success) {
            results.push({
                test_case: i + 1,
                input,
                output: trimmedExpectedOutput,
                actual: '',
                status: 'FAILED',
            });
        }
    }

    res.status(200).json(results);
};

