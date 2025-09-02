import { Request, Response } from "express";
import { IBaseRequest } from "../../Interfaces/core_interfaces";

export const wakeUp = async (req: IBaseRequest, res: Response) => {
    console.log('I am awake!!!');
    res.status(200).json({ message: "Server is awake 🚀" });
    return;
};
