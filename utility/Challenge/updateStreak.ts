import UserDetails from "../../models/Users/UserDetails";

export const updateStreak = async (userId: string) => {
    try {
        const userDetails = await UserDetails.findOne({ user_id: userId });

        if (!userDetails) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastMatchDate = userDetails.last_match_date
            ? new Date(userDetails.last_match_date)
            : null;

        let newStreak = 1;
        let streakStartDate = today;

        if (lastMatchDate) {
            lastMatchDate.setHours(0, 0, 0, 0);

            const diffInDays =
                (today.getTime() - lastMatchDate.getTime()) / (1000 * 60 * 60 * 24);

            if (diffInDays === 1) {
                // User played yesterday, continue streak
                newStreak = (userDetails.streak?.current || 0) + 1;
                streakStartDate = userDetails.streak?.start_date || today;
            } else if (diffInDays > 1) {
                // User missed a day, reset streak
                newStreak = 1;
                streakStartDate = today;
            }
        }

        // Update longest streak if needed
        let longestStreak = userDetails.streak?.longest || 0;
        let longestStreakStartDate = userDetails.streak?.longest_start_date || today;

        if (newStreak > longestStreak) {
            longestStreak = newStreak;
            longestStreakStartDate = streakStartDate;
        }

        await UserDetails.findOneAndUpdate(
            { user_id: userId },
            {
                $set: {
                    "streak.current": newStreak,
                    "streak.start_date": streakStartDate,
                    "streak.longest": longestStreak,
                    "streak.longest_start_date": longestStreakStartDate,
                    last_match_date: today,
                },
            }
        );
    } catch (error) {
        console.error("Error updating streak:", error);
    }
};
