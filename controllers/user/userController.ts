import User from "../../Models/Users/Users";
import UserStats from "../../Models/Users/UserStats";
import { getAll } from "../../Utility/handlerFactory";
import UserModel from "../../Models/Users/Users";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { updateLoginStreak } from "./userProfileController";
import { userSockets } from "../../App";

export const getAllUsers = getAll(User);

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const { userId, username } = req.query;
        let userStats;

        if (userId) {
            userStats = await UserStats.findOne({ user_id: userId }).populate("user_id");
        } else if (username) {
            const user = await UserModel.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            userStats = await UserStats.findOne({ user_id: user._id }).populate("user_id");
        }

        if (!UserStats) {
            return res.status(404).json({ message: "User details not found" });
        }

        res.status(200).json(userStats);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getUserRating = async (req, res) => {
    try {
        const userRating = await UserStats.findOne({ user_id: req.params.id }).select('rating');
        const timezone = req.headers['x-user-timezone'] as string;
        if (!userRating) {
            return res.status(404).json({ message: "User details not found" });
        }
        await updateLoginStreak(req.params.id, timezone)
        res.status(200).json(userRating);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const resetUserStats = async (req: Request, res: Response) => {
  try {
    const defaultStats = {
      matches_played: 0,
      rating: 800,
      highest_rating: 800,
      wins: 0,
      draw: 0,
      loss: 0,
      streak: {
        current: 0,
        longest: 0,
        start_date: null,
        longest_start_date: null,
      },
      last_match_date: null,
      daily_matches: {},
      last_login_date: null,
      login_streak: 0,
      longest_login_streak: 0,
    };

    const userId = req.query.userId as string | undefined;

    if (userId) {
      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: "Invalid user ID" });
        return
      }

      const updatedStats = await UserStats.findOneAndUpdate(
        { user_id: userId },
        { $set: defaultStats },
        { new: true }
      );

      if (!updatedStats) {
        res.status(404).json({ message: "User stats not found" });
        return
      }

      res.status(200).json({ message: "User stats reset successfully", updatedStats });
      return;
    } else {
      // Reset all users stats
      const result = await UserStats.updateMany({}, { $set: defaultStats });

      res.status(200).json({
        message: "All user stats reset successfully",
        modifiedCount: result.modifiedCount,
      });

      return;
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
    return;
  }
};

export const getOnlineUsers = async (req, res) => {
    try {
        const onlineUsers = Array.from(userSockets.keys());
        const { username } = req.query;

        let isUserOnline;

        if (username) {
            const user = await UserModel.findOne({ username }).select('_id');
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            isUserOnline = onlineUsers.includes(user._id.toString());
        }

        res.status(200).json({
            count: onlineUsers.length,
            ...(username && { isUserOnline })
        });
    } catch (error) {
        console.error("Error fetching online users:", error);
        res.status(500).json({ message: "Server error", error });
    }
};



