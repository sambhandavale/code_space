import { IUserStreaks } from "../../interfaces/UserInterfaces";

interface UserStreakProps {
    userstreak_info: IUserStreaks | undefined;
    loading: boolean;
}

const UserStreaks = ({ userstreak_info, loading }: UserStreakProps) => {
    return (
        <>
            {!loading ? (
                <div className="user-streak">
                    <div className="streak_tile__row">
                        <div className="streak_tile">
                            <div className="streak_tile__label ff-google-n white">
                                <span className="big__label">{userstreak_info?.longestLoginStreak}</span>
                                <span className="small__label">Days</span>
                            </div>
                            <div className="streak_tile__value ff-google-n white">Longest Streak</div>
                        </div>
                        <div className="streak_tile">
                            <div className="streak_tile__label ff-google-n white">
                                <span className="big__label">{userstreak_info?.currentLoginStreak}</span>
                                <span className="small__label">Days</span>
                            </div>
                            <div className="streak_tile__value ff-google-n white">Current Streak</div>
                        </div>
                    </div>
                    <div className="streak_tile__row">
                        <div className="streak_tile">
                            <div className="streak_tile__label ff-google-n white">
                                <span className="big__label">{userstreak_info?.highestRating}</span>
                            </div>
                            <div className="streak_tile__value ff-google-n white">Highest Rating</div>
                        </div>
                        <div className="streak_tile">
                            <div className="streak_tile__label ff-google-n white">
                                <span className="big__label">{userstreak_info?.totalMatches}</span>
                                <span className="small__label">Matches</span>
                            </div>
                            <div className="streak_tile__value ff-google-n white">Total Matches</div>
                        </div>
                    </div>
                </div>
            ) : (
                <UserStreaksSkeleton />
            )}
        </>
    )
}

const UserStreaksSkeleton = () => {
    return (
        <div className="user-streak">
            {Array.from({ length: 2 }).map((_, rowIndex) => (
                <div className="streak_tile__row" key={rowIndex}>
                    {Array.from({ length: 2 }).map((_, tileIndex) => (
                        <div className="streak_tile" key={tileIndex}>
                            <div className="streak_tile__label ff-google-n white">
                                <div className="skeleton-box" style={{ width: "50px", height: "30px", marginBottom: "5px" }}></div>
                                <div className="skeleton-box" style={{ width: "30px", height: "15px" }}></div>
                            </div>
                            <div className="streak_tile__value ff-google-n white">
                                <div className="skeleton-box" style={{ width: "120px", height: "15px" }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default UserStreaks;
