import { Request, Response } from "express";
import UserStats, { IUserStats } from "../../models/Users/UserStats";
import UserModel, { IUser } from "../../models/Users/Users";
import UserProfile, { IUserProfile } from "../../models/Users/UserProfile";
import { formatDate } from "../../utility/utils";
import UserChallengesModel, { IUserChallenges } from "../../models/Challenges/User-Challenges";
import Users from "../../models/Users/Users";

export const getUserProfileDetails = async (req: Request, res: Response) => {
    try {
        const username = req.query.username;
        const userId = req.query.userId;
        const timezone = req.headers['x-user-timezone'] as string || 'UTC';
        let userInfo:IUser;
        let userStats:IUserStats;
        let userProfile:IUserProfile;

        if (userId) {
            userInfo = await UserModel.findById(userId);
            if (!userInfo) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            userProfile = await UserProfile.findOne({ user_id: userId });
            userStats = await UserStats.findOne({ user_id: userId }).populate("user_id");
        } else if (username) {
            const user = await UserModel.findOne({ username });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
            userInfo = user;
            userStats = await UserStats.findOne({ user_id: user._id }).populate("user_id");
            userProfile = await UserProfile.findOne({ user_id: user._id });
        } else {
            res.status(400).json({ message: "User ID or Username is required" });
            return;
        }

        if (!userStats || !userProfile) {
            res.status(404).json({ message: "User stats or profile not found" });
            return;
        }

        const challenges = await UserChallengesModel.find({ players: userInfo._id })
            .populate('players', 'username full_name')
            .lean();

        const userMatches = challenges.map((challenge) => {
            const opponent = (challenge.players as any[]).find(p => p._id.toString() !== userInfo._id.toString());

            let result = 'Draw';
            if (challenge.winner) {
                result = challenge.winner.toString() === userInfo._id.toString() ? 'Win' : 'Loss';
            }

            return {
                challengeId:challenge._id,
                opponentName: opponent?.full_name || opponent?.username || 'Unknown',
                language: challenge.language,
                time: challenge.time,
                result,
                startTime: formatDate(challenge.start_time, timezone),
            };
        });

        const userStreaks = {
            currentLoginStreak: userStats.login_streak || 0,
            longestLoginStreak: userStats.longest_login_streak || 0,
            highestRating: userStats.highest_rating || 0,
            totalMatches: userStats.matches_played || 0,
        }

        const profileCardInfo = {
            userBio: userProfile.bio || "",
            userEmail: userInfo.email,
            joinedOn: formatDate(userInfo['createdAt'], timezone),
            userRating:userStats.rating,
            userTitle:userProfile.title,
            fullName:userInfo['full_name'],
            username:userInfo.username,
        }

        const dailyMatches = userStats.daily_matches;

        const userFavourites = userProfile.favorites;
        const userSocials = userProfile.socials;

        res.status(200).json({
            message: "User profile details fetched successfully",
            data: {
                userStreaks,
                profileCardInfo,
                dailyMatches,
                userFavourites,
                userSocials,
                userMatches,
            }
        });

        return;

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const { userId, socials, favorites, profileCardInfo } = req.body;

        if (!userId) {
            res.status(400).json({ message: "userId is required" });
            return;
        }

        const updateProfilePayload: any = {};
        const updateUserPayload: any = {};

        if (Array.isArray(socials)) {
            updateProfilePayload.socials = socials;
        }

        if (Array.isArray(favorites)) {
            updateProfilePayload.favorites = favorites;
        }

        if (profileCardInfo) {
            const { userBio, userEmail, fullName } = profileCardInfo;

            if (userBio !== undefined) {
                updateProfilePayload.bio = userBio;
            }

            if (userEmail !== undefined) {
                const existingUser = await Users.findOne({ email: userEmail, _id: { $ne: userId } });
                if (existingUser) {
                    res.status(400).json({ message: "Email is already in use by another user." });
                    return;
                }
                updateUserPayload.email = userEmail;
            }

            if (fullName !== undefined) {
                const nameParts = fullName.trim().split(" ");
                updateUserPayload.first_name = nameParts[0] || "";
                updateUserPayload.last_name = nameParts.slice(1).join(" ") || "";
            }
        }

        if (Object.keys(updateProfilePayload).length === 0 && Object.keys(updateUserPayload).length === 0) {
            res.status(400).json({ message: "No valid fields to update" });
            return;
        }

        // Update UserProfile
        let updatedProfile = null;
        if (Object.keys(updateProfilePayload).length > 0) {
            updatedProfile = await UserProfile.findOneAndUpdate(
                { user_id: userId },
                updateProfilePayload,
                { new: true }
            );
        }

        // Update Users model
        let updatedUser = null;
        if (Object.keys(updateUserPayload).length > 0) {
            updatedUser = await Users.findOneAndUpdate(
                { _id: userId },
                updateUserPayload,
                { new: true }
            );
        }

        if (!updatedProfile && !updatedUser) {
            res.status(404).json({ message: "User profile not found" });
            return;
        }

        res.status(200).json({
            message: "User profile updated successfully",
            data: {
                socials: updatedProfile?.socials,
                favorites: updatedProfile?.favorites,
                userBio: updatedProfile?.bio,
                userEmail: updatedUser?.email,
                fullName: `${updatedUser?.first_name ?? ""} ${updatedUser?.last_name ?? ""}`.trim()
            },
        });
        return;
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Server error", error });
        return;
    }
};

