import UserStats from "../../Models/Users/UserStats";
import moment from "moment-timezone";

export const updateChallengeStreak = async (userId: string, timezone: string) => {
    try {
        const userStats = await UserStats.findOne({ user_id: userId });
        const now = moment().tz(timezone);
        const todayString = now.format("YYYY-MM-DD");

        if (userStats) {
            const lastMatchDate = userStats.last_match_date ? moment(userStats.last_match_date).tz(timezone) : null;
            let shouldIncrementStreak = false;

            if (lastMatchDate) {
                const lastMatchDay = lastMatchDate.format("YYYY-MM-DD");
                const yesterday = now.clone().subtract(1, "day").format("YYYY-MM-DD");

                if (lastMatchDay === yesterday) {
                    shouldIncrementStreak = true;
                } else if (lastMatchDay === todayString) {
                    shouldIncrementStreak = false; // Already played today
                } else {
                    // Missed a day, reset streak
                    userStats.streak.current = 0;
                    userStats.streak.start_date = now.toDate();
                }
            }

            if (shouldIncrementStreak) {
                userStats.streak.current = (userStats.streak.current || 0) + 1;
            } else if (userStats.streak.current === undefined || userStats.streak.current === null || userStats.streak.current === 0) {
                userStats.streak.current = 1;
                userStats.streak.start_date = now.toDate();
            }

            if (!userStats.streak.longest || userStats.streak.current > userStats.streak.longest) {
                userStats.streak.longest = userStats.streak.current;
                userStats.streak.longest_start_date = userStats.streak.start_date;
            }

            userStats.last_match_date = now.toDate();

            await userStats.save();
        }
    } catch (error) {
        console.error("Error updating challenge streak:", error);
    }
};
