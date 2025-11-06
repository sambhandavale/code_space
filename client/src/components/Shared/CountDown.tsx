import { useEffect, useState } from "react";
import dayjs from "dayjs";

export const useCountdown = (targetDate: string) => {
  const [countdown, setCountdown] = useState("0d:0h:0m");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const end = dayjs(targetDate);

      const diff = end.diff(now); // difference in milliseconds

      if (diff <= 0) {
        setCountdown("0d:0h:0m");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown(`${days}d:${hours}h:${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return countdown;
};

export const renderCountdown = (countdown: string) => {
  // Split the string: "5d:21h:33m"
  const parts = countdown.split(":"); // ["5d", "21h", "33m"]

  return (
    <>
      {parts.map((part, idx) => {
        const value = part.slice(0, -1); // numeric part
        const unit = part.slice(-1); // 'd', 'h', 'm'
        return (
          <span key={idx}>
            {value}
            <span className={`yellow countdown-${unit}`}>{unit}</span>
            {idx < parts.length - 1 && ":"}
          </span>
        );
      })}
    </>
  );
};
