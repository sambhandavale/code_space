import UserStats from "../../Models/Users/UserStats";
import UserProfile from "../../Models/Users/UserProfile";

function getTitleFromRating(rating: number): { title: string; code: string } {
    if (rating < 1000) return { title: "Pupil", code: "PU" };
    else if (rating < 1200) return { title: "Novice Developer", code: "ND" };
    else if (rating < 1400) return { title: "Apprentice Coder", code: "AC" };
    else if (rating < 1600) return { title: "Specialist Programmer", code: "SP" };
    else if (rating < 1800) return { title: "Expert Engineer", code: "EE" };
    else if (rating < 2000) return { title: "Candidate Master Coder", code: "CMC" };
    else if (rating < 2200) return { title: "Developer Master", code: "DM" };
    else if (rating < 2400) return { title: "International Coder", code: "IC" };
    else if (rating < 2600) return { title: "Grandmaster Developer", code: "GMD" };
    else return { title: "Legendary Architect", code: "LA" };
}

export async function updateUserTitleByRating(userId: string) {
    const stats = await UserStats.findOne({ user_id: userId });
    if (!stats || stats.rating === undefined) return;

    const { title, code } = getTitleFromRating(stats.rating);
    await UserProfile.findOneAndUpdate(
        { user_id: userId },
        { title: `${title} (${code})` },
        { upsert: true }
    );
}
