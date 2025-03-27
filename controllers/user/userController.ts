import User from "../../models/Users/Users";
import UserDetails from "../../models/Users/UserDetails";
import { getAll } from "../../utility/handlerFactory";

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

export const getUserDetailsById = async (req, res) => {
    try {
        const userDetails = await UserDetails.findOne({ user_id: req.params.id }).populate("user_id");
        if (!userDetails) {
            return res.status(404).json({ message: "User details not found" });
        }
        res.status(200).json(userDetails);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
