import { Request } from "express";
import { IUser } from "../Models/Users/Users";
import { ParamsDictionary } from 'express-serve-static-core';

export interface IBaseRequest extends Request {
  user: Partial<IUser>;
  baseUrl: string;
  query: { [index: string]: string };
  file?: Express.Multer.File;
}

export interface IError extends Error {
  statusCode: any;
  status: any;
  message: any;
  stack?: any;
  isOperational: boolean;
  name: string;
}
