import { IProfileCardInfo } from "../../interfaces/UserInterfaces";
import { isAuth } from "../../utility/helper";

interface ContributionDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

interface IUserActivities {
  data: ContributionDay[];
  userInfo: IProfileCardInfo | undefined;
  loading:boolean;
}

const getColor = (count: number) => {
  if (count === 0) return "level-0";
  if (count < 2) return "level-1";
  if (count < 4) return "level-2";
  if (count < 6) return "level-3";
  return "level-4";
};

const UserActivities = ({ data, userInfo,loading }: IUserActivities) => {
    const daysMap = new Map<string, number>();
    data.forEach(({ date, count }) => daysMap.set(date, count));
    const itsMe = isAuth() ? userInfo?.username === isAuth().username : false;

    const formatDate = (date: Date) => date.toLocaleDateString('en-CA');

    const today = formatDate(new Date());
    let startDate: Date;

    if (data.length > 0) {
        // Find the earliest match date
        const dates = data.map(d => new Date(d.date));
        const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
        startDate = new Date(minDate);
        startDate.setMonth(startDate.getMonth() - 3);
    } else {
        // If no data, start from 3 months before today
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 3);
    }

    // Prepare cells
    const cells: { date: string; count: number }[] = [];

    let date = new Date(startDate);

    while (formatDate(date) <= today) { // Compare as string "YYYY-MM-DD"
        const key = formatDate(date);
        cells.push({ date: key, count: daysMap.get(key) ?? 0 });
        date.setDate(date.getDate() + 1);
    }

    const weeks: { date: string; count: number }[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    const monthLabels: string[] = [];

    for (let i = 0; i < weeks.length; i++) {
        const currentWeek = weeks[i];
        const firstDate = new Date(currentWeek[0].date);
        const currentMonth = firstDate.getMonth();

        const prevWeek = weeks[i - 1];
        const prevMonth = prevWeek ? new Date(prevWeek[0].date).getMonth() : -1;

        if (currentMonth !== prevMonth) {
            monthLabels.push(firstDate.toLocaleString("default", { month: "short" }));
        } else {
            monthLabels.push("");
        }
    }

    return (
        <>
        {!loading ? (
            <div className="wrapper_user_activities">
                <div className="user_activities">
                    <div className="username ff-google-n white">{itsMe ? 'Your' : `${userInfo?.username}'s`} Activity</div>
                    <div className="grid-container__wrapper scrollbar">
                        <div className="grid-container">
                            <div className="month-labels">
                                {monthLabels.map((month, idx) => (
                                    <div className="month ff-google-n white" key={idx}>
                                        {month}
                                    </div>
                                ))}
                            </div>
                            <div className="contribution-grid">
                                {weeks.map((week, i) => (
                                    <div className="week" key={i}>
                                        {week.map((day, j) => (
                                            <div
                                                key={j}
                                                className={`cell ${getColor(day.count)}`}
                                                title={`${day.date}: ${day.count} matches`}
                                                aria-label={`${day.count} matches on ${day.date}`}
                                                role="img"
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ):(
            <UserActivitiesSkeleton/>
        )}
        </>
    );
};

const UserActivitiesSkeleton = () => {
    const months = Array.from({ length: 12 });

    return (
        <div className="wrapper_user_activities">
            <div className="user_activities">
                <div className="skeleton-box" style={{ width: "150px", height: "20px", marginBottom: "20px" }}></div>

                <div className="grid-container__wrapper scrollbar">
                    <div className="grid-container">
                        <div className="month-labels">
                            {months.map((_, idx) => (
                                <div key={idx} className="month skeleton-box" style={{ width: "30px", height: "15px" }}></div>
                            ))}
                        </div>

                        {/* <div className="contribution-grid">
                            {weeks.map((_, i) => (
                                <div className="week" key={i}>
                                    {days.map((_, j) => (
                                        <div
                                            key={j}
                                            className="skeleton-box"
                                            style={{
                                                width: "15px",
                                                height: "15px",
                                                marginBottom: "4px",
                                                marginRight: "4px",
                                                borderRadius: "3px",
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserActivities;
