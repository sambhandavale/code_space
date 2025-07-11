import { Request, Response } from "express";
import UserChallengesModel from "../../models/Challenges/User-Challenges";
import Question from "../../models/Challenges/Question";
import UserStats from "../../models/Users/UserStats";
import moment from "moment";
import { updateChallengeStreak } from "../../utility/Challenge/updateStreak";
import { updateUserFavorites } from "../../utility/User/updateFavourites";
import UserModel from "../../models/Users/Users";
import mongoose from "mongoose";

function generateRoomCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const createPrivateChallenge = async (req: Request, res: Response) => {
    const {userId, language, timeControl } = req.body;
    const timezone = req.headers['x-user-timezone'] as string;

    const roomCode = generateRoomCode();

    const difficultyMap: Record<number, string> = {
        5: "Easy",
        10: "Medium",
        20: "Hard",
    };

    const difficulty = difficultyMap[timeControl]

    const problem = await Question.aggregate([
        { $match: { difficulty,approved:true } },
        { $sample: { size: 1 } }
    ]);
    
    const problemId = problem[0]._id;

    const player = await UserModel.findById(userId).select('email username first_name last_name');
    if (!player){
      res.status(404).json({ message: "User not found" })
      return;
    };

    const challenge = await UserChallengesModel.create({
        players: [
            {
                user_id: player._id,
                email: player.email,
                username: player.username,
                full_name: `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim()
            }
        ],
        language,
        time: timeControl,
        problem_id: problemId,
        room_code: roomCode,
        is_private: true,
        status: "waiting",
        winner: null,
        rating_change: {},
    });

    res.json({ roomCode, challengeId: challenge._id });
};

export const joinPrivateChallenge = async (req: Request, res: Response) => {
  const { userId, roomCode } = req.body;
  const timezone = req.headers['x-user-timezone'] as string;

  const challenge = await UserChallengesModel.findOne({ room_code: roomCode });

  if (!challenge || challenge.status !== "waiting") {
    res.status(400).json({ message: "Room not found or already started" });
    return 
  }

  if (challenge.players.length >= 2) {
    res.status(400).json({ message: "Room is full" });
    return
  }

  const player = await UserModel.findById(userId).select('email username first_name last_name');
  if (!player){
    res.status(404).json({ message: "User not found" });
    return;
  };

  challenge.players.push({
      user_id: new mongoose.Types.ObjectId(player._id.toString()),
      email: player.email,
      username: player.username,
      full_name: `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim()
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
                [`daily_matches.${today}.count`]: 1, // Increment match count for today
            },
            $push: {
                [`daily_matches.${today}.challenges`]: challenge._id, // Store challenge ID
            },
        },
        { upsert: true, new: true }
    ),
    UserStats.findOneAndUpdate(
        { user_id: challenge.players[0] },
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

  res.json({ challengeId: challenge._id });
};


export const checkRoomStatus = async (req: Request, res: Response) => {
  const { roomCode } = req.params;

  const challenge = await UserChallengesModel.findOne({ room_code: roomCode });

  if (!challenge) {
    res.status(404).json({ message: "Room not found" });
    return;
  }

  const createdAt = challenge['createdAt'];
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / 60000;

  const MAX_WAIT_MINUTES = 5;

  if (challenge.status === "waiting" && diffMinutes > MAX_WAIT_MINUTES) {
    challenge.status = "stale";
    challenge.active = false;
    await challenge.save();

    res.status(410).json({ message: "Room expired", status: "stale" });
    return;
  }

  res.json({
    status: challenge.status,
    challengeId: challenge._id,
  });
};

