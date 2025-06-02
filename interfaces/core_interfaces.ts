import { Request } from "express";
import { IUser } from "../models/Users/Users";

// export interface IBaseRequest extends Request {
//   user: Partial<IUser>;
//   baseUrl: string;
//   query: { [index: string]: string };
// }

export interface IBaseRequest<
  Body = any,
  Params = any,
  Query = { [key: string]: string }
> extends Request<Params, any, Body, Query> {
  user: Partial<IUser>;
  baseUrl: string;
}

export interface IError extends Error {
  statusCode: any;
  status: any;
  message: any;
  stack?: any;
  isOperational: boolean;
  name: string;
}
