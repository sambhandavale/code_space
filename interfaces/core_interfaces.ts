import { Request } from "express";
import { IUser } from "../models/Users/Users";

export interface IBaseRequest extends Request {
  user: Partial<IUser>;
}

export interface IError extends Error {
  statusCode: any;
  status: any;
  message: any;
  stack?: any;
  isOperational: boolean;
  name: string;
}
