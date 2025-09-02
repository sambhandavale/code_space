import { Request, Response } from "express";
import { getAll } from "../../Utility/handlerFactory";
import UserChallenges from "../../Models/Challenges/User-Challenges";
import { ChallengeService } from "../../Services/ChallengeServices/challengeServices";
import { io, userSockets } from "../../App";

/*
Note: Message code meaning -
10: Got all right u---won,
11: Opponent got all answers right---lost,
30: Opponent left---won,
31: You left---lost,
40: Draw
*/

export const emitToUser = (userId: string, event: string, data: any) => { 
    const socketIds = userSockets.get(userId); 
    if (socketIds && socketIds.size > 0) { 
        socketIds.forEach(socketId => { 
            io.to(socketId).emit(event, data); 
        }); 
    } 
};

export const getAllChallenges = getAll(UserChallenges);

export const getChallengeStatus = async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.params;
    const result = await ChallengeService.getChallengeStatus(challengeId);
    res.status(200).json({ status: "success", data: result });
  } catch (err: any) {
    res.status(404).json({ status: "error", message: err.message });
  }
};

export const leaveChallenge = async (req: Request, res: Response) => {
  try {
    const { challengeId, userId } = req.body;
    const result = await ChallengeService.leaveChallenge(challengeId, userId);
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

export const acceptDrawChallenge = async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.body;
    const { timeup } = req.query;
    const result = await ChallengeService.acceptDrawChallenge(challengeId, Boolean(timeup));
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

export const askDrawChallenge = async (req: Request, res: Response) => {
  try {
    const { challengeId, userId } = req.body;
    const result = await ChallengeService.askDrawChallenge(challengeId, userId);
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

export const rejectDrawChallenge = async (req: Request, res: Response) => {
  try {
    const { challengeId, userId } = req.body;
    const result = await ChallengeService.rejectDrawChallenge(challengeId, userId);
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(400).json({ status: "error", message: err.message });
  }
};
