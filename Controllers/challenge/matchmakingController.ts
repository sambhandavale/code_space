import { Request, Response } from "express";
import { MatchmakingService } from "../../Services/ChallengeServices/matchmakingService";

export const joinMatchmaking = async (req: Request, res: Response) => {
  try {
    const { userId, language, timeControl } = req.body;
    const timezone = req.headers["x-user-timezone"] as string;

    const result = await MatchmakingService.joinMatchmaking(userId, language, timeControl, timezone);

    if (result.alreadyInChallenge) {
      res.status(400).json({
        message: "Already in a challenge",
        challengeId: result.challengeId,
      });
      return
    }

    if (result.matchFound) {
      res.status(200).json({ message: "Match found!" });
      return
    }

    res.status(200).json({ message: "Searching for a match..." });
  } catch (error) {
    console.error("Error joining matchmaking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveMatchmaking = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    await MatchmakingService.leaveMatchmaking(userId);

    res.status(200).json({ message: "Left matchmaking successfully." });
  } catch (error) {
    console.error("Error leaving matchmaking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
