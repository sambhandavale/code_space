import mongoose from "mongoose";
import UserChallengesModel from "../../Models/Challenges/User-Challenges";
import UserProfile from "../../Models/Users/UserProfile";

export const updateUserFavorites = async (userId: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }

        const challenges = await UserChallengesModel.find({ "players.user_id": userId });

        if (challenges.length === 0) {
            throw new Error("No challenges found for this user.");
        }

        const languageCount: Record<string, number> = {};
        const timeControlCount: Record<number, number> = {};

        challenges.forEach(challenge => {
            languageCount[challenge.language] = (languageCount[challenge.language] || 0) + 1;
            timeControlCount[challenge.time] = (timeControlCount[challenge.time] || 0) + 1;
        });

        const favoriteLanguage = Object.keys(languageCount).reduce((a, b) => languageCount[a] > languageCount[b] ? a : b);
        const favoriteTimeControl = Object.keys(timeControlCount).reduce((a, b) => timeControlCount[a] > timeControlCount[b] ? a : b);

        const userProfile = await UserProfile.findOne({ user_id: userId });
        if (!userProfile) {
            throw new Error("User profile not found");
        }

        const updatedFavorites = userProfile.favorites.map(fav => {
            if (fav.category === "Language") return { ...fav, value: favoriteLanguage };
            if (fav.category === "Time Control") return { ...fav, value: favoriteTimeControl };
            return fav;
        });

        userProfile.favorites = updatedFavorites;
        await userProfile.save();

        return { success: true, favorites: updatedFavorites };
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
};
