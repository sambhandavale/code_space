import User from "../../models/Users/Users";
import UserStats from "../../models/Users/UserStats";
import { getAll } from "../../utility/handlerFactory";
import UserModel from "../../models/Users/Users";

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
        if (!userRating) {
            return res.status(404).json({ message: "User details not found" });
        }
        res.status(200).json(userRating);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
