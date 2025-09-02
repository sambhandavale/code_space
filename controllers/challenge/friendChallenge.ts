import { Request, Response } from "express";
import { PrivateChallengeService } from "../../Services/ChallengeServices/friendChallengeService";

export const createPrivateChallenge = async (req: Request, res: Response) => {
  try {
    const { userId, language, timeControl } = req.body;

    const result = await PrivateChallengeService.createPrivateChallenge(
      userId,
      language,
      timeControl
    );

    res.status(201).json({
      status: "success",
      message: "Private challenge created successfully",
      data: result,
    });
    return
  } catch (error: any) {
    console.error("Error creating private challenge:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
    return
  }
};

export const joinPrivateChallenge = async (req: Request, res: Response) => {
  try {
    const { userId, roomCode } = req.body;
    const timezone = req.headers["x-user-timezone"] as string;

    const result = await PrivateChallengeService.joinPrivateChallenge(
      userId,
      roomCode,
      timezone
    );

    res.status(200).json({
      status: "success",
      message: "Joined private challenge successfully",
      data: result,
    });
    return
  } catch (error: any) {
    console.error("Error joining private challenge:", error);
    res.status(400).json({
      status: "error",
      message: error.message || "Unable to join challenge",
    });
    return
  }
};

export const checkRoomStatus = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;

    const result = await PrivateChallengeService.checkRoomStatus(roomCode);

    if (result.expired) {
      res.status(410).json({
        status: "stale",
        message: "Room expired",
      });
      return 
    }

    res.status(200).json({
      status: "success",
      message: "Room status retrieved successfully",
      data: result,
    });
    return
  } catch (error: any) {
    console.error("Error checking room status:", error);
    res.status(404).json({
      status: "error",
      message: error.message || "Room not found",
    });
    return 
  }
};
