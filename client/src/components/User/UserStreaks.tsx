import { IUserStreaks } from "../../interfaces/UserInterfaces";

interface UserStreakProps {
    userstreak_info: IUserStreaks;
}

const UserStreaks = ({ userstreak_info }: UserStreakProps) => {
  return (
    <div className="user-streak">
        <div className="streak_tile__row">
            <div className="streak_tile">
                <div className="streak_tile__label ff-google-n white"><span className="big__label">{userstreak_info.longestLoginStreak}</span><span className="small__label">Days</span></div>
                <div className="streak_tile__value ff-google-n white">Longest Streak</div>
            </div>
            <div className="streak_tile">
                <div className="streak_tile__label ff-google-n white"><span className="big__label">{userstreak_info.currentLoginStreak}</span><span className="small__label">Days</span></div>
                <div className="streak_tile__value ff-google-n white">Current Streak</div>
            </div>
        </div>
        <div className="streak_tile__row">
            <div className="streak_tile">
                <div className="streak_tile__label ff-google-n white"><span className="big__label">{userstreak_info.highestRating}</span></div>
                <div className="streak_tile__value ff-google-n white">Higest Rating</div>
            </div>
            <div className="streak_tile">
                <div className="streak_tile__label ff-google-n white"><span className="big__label">{userstreak_info.totalMatches}</span><span className="small__label">Matches</span></div>
                <div className="streak_tile__value ff-google-n white">Total Matches</div>
            </div>
        </div>
    </div>
  )
}

export default UserStreaks;
