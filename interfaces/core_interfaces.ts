import { Request } from "express";
import { IUser } from "../models/Users/Users";
import { ParamsDictionary } from 'express-serve-static-core';

export interface IBaseRequest extends Request<ParamsDictionary, any, any, any> {
  user: Partial<IUser>;
  baseUrl: string;
  query: { [index: string]: string };
}

export interface IError extends Error {
  statusCode: any;
  status: any;
  message: any;
  stack?: any;
  isOperational: boolean;
  name: string;
}
