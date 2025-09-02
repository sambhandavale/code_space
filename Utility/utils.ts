import { IBaseRequest } from "../Interfaces/core_interfaces";
import { Request, Response, NextFunction } from "express";

// Update catchAsync to handle IBaseRequest
export const catchAsync = (
  fn: (req: IBaseRequest, res: Response, next?: NextFunction) => Promise<any>
) => {
  return (req: IBaseRequest, res: Response, next?: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const formatDate = (date: Date, timezone: string = 'UTC') => {
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        // year: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: timezone
    };

    const formattedDate = new Date(date).toLocaleDateString('en-GB', options);
    const day = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', timeZone: timezone });
    const dayWithSuffix = addOrdinalSuffix(Number(day));

    // Final format: 5th June 2025
    return formattedDate.replace(/^\d+/, dayWithSuffix);
}

const addOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
    }
}
