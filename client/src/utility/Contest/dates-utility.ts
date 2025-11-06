import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);

export const formattedDate = (date: string) => {
  const formatted = dayjs(date)
    .tz(dayjs.tz.guess())
    .format("Do MMM ‘YY hh:mmA"); // "12th Nov ‘25 11:00PM"

  // Split date and time
  const lastSpaceIndex = formatted.lastIndexOf(" ");
  const datePart = formatted.slice(0, lastSpaceIndex); // "12th Nov ‘25"
  const timePart = formatted.slice(lastSpaceIndex + 1); // "11:00PM"

  return { datePart, timePart };
};
