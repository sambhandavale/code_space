import { Request, Response } from "express";
import { ChallengeResultService } from "../../Services/ChallengeServices/challengeResultService";

export const submitChallengeResult = async (req: Request, res: Response) => {
  try {
    const { challengeId, winnerId, ratingChanges, winnerCode, testcases } = req.body;

    const result = await ChallengeResultService.submitChallengeResult(
      challengeId,
      winnerId,
      ratingChanges,
      winnerCode,
      testcases
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error submitting challenge result:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getChallengeById = async (req: Request, res: Response) => {
  try {
    const result = await ChallengeResultService.getChallengeById(req.params.id);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error fetching challenge:", error);
    res.status(404).json({ error: error.message || "Challenge not found" });
  }
};
