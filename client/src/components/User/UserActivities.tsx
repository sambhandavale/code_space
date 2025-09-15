import { IProfileCardInfo } from "../../interfaces/UserInterfaces";
import { isAuth } from "../../utility/helper";

type ActivityType = "match" | "question" | "both";

interface ContributionDay {
  date: string;   // "YYYY-MM-DD"
  count: number;  // total activity count for that day
  type: ActivityType; // ← NEW: what kind of activity
}

interface IUserActivities {
  data: ContributionDay[];
  userInfo: IProfileCardInfo | undefined;
  loading: boolean;
}

const getColor = (count: number) => {
  if (count === 0) return "level-0";
  if (count < 2) return "level-1";
  if (count < 4) return "level-2";
  if (count < 6) return "level-3";
  return "level-4";
};

const UserActivities = ({ data, userInfo, loading }: IUserActivities) => {
  // Map date -> {count,type}
  const daysMap = new Map<string, { count: number; type: ActivityType }>();
  data.forEach(({ date, count, type }) => daysMap.set(date, { count, type }));

  const itsMe = isAuth() ? userInfo?.username === isAuth().username : false;

  const formatDate = (date: Date) => date.toLocaleDateString("en-CA");
  const today = formatDate(new Date());
  let startDate: Date;

  if (data.length > 0) {
    // Find the earliest activity date and start 3 months before it
    const dates = data.map(d => new Date(d.date));
    const minDate = new Date(Math.min(...dates.map(date => date.getTime())));
    startDate = new Date(minDate);
    startDate.setMonth(startDate.getMonth() - 3);
  } else {
    // If no data, start from 3 months before today
    startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 3);
  }

  // Prepare cells: one per calendar day
  const cells: ContributionDay[] = [];
  let date = new Date(startDate);

  while (formatDate(date) <= today) {
    const key = formatDate(date);
    const activity = daysMap.get(key);
    cells.push({
      date: key,
      count: activity?.count ?? 0,
      type: activity?.type ?? "match" // default label when no activity
    });
    date.setDate(date.getDate() + 1);
  }

  // Group cells by week (7 days per column)
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Month labels along the top
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
            <div className="username ff-google-n white">
              {itsMe ? "Your" : `${userInfo?.username}'s`} Activity
            </div>
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
                          title={`${day.date}: ${day.count} ${
                            day.type === "question"
                              ? day.count > 1 ? "questions" : 'question'
                              : day.type === "match"
                              ? day.count > 1 ? "matches" : 'match'
                              : "activities"
                          }`}
                          aria-label={`${day.count} ${
                            day.type === "question"
                              ? day.count > 1 ? "questions" : 'question'
                              : day.type === "match"
                              ? day.count > 1 ? "matches" : 'match'
                              : "activities"
                          } on ${day.date}`}
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
      ) : (
        <UserActivitiesSkeleton />
      )}
    </>
  );
};

const UserActivitiesSkeleton = () => {
  const months = Array.from({ length: 12 });
  return (
    <div className="wrapper_user_activities">
      <div className="user_activities">
        <div
          className="skeleton-box"
          style={{ width: "150px", height: "20px", marginBottom: "20px" }}
        ></div>

        <div className="grid-container__wrapper scrollbar">
          <div className="grid-container">
            <div className="month-labels">
              {months.map((_, idx) => (
                <div
                  key={idx}
                  className="month skeleton-box"
                  style={{ width: "30px", height: "15px" }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivities;
