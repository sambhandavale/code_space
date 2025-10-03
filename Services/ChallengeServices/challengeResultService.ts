import { emitToUser } from "../../Controllers/Challenge/challengeController";
import UserChallenges from "../../Models/Challenges/User-Challenges";
import UserStats from "../../Models/Users/UserStats";
import { updateUserTitleByRating } from "../../Utility/User/updateUserTitle";

export class ChallengeResultService {
  static async submitChallengeResult(
    challengeId: string,
    winnerId: string,
    ratingChanges: Record<string, number>,
    winnerCode: string,
    testcases: number
  ) {
    // Convert ratingChanges to an array to get [winnerRating, loserRating]
    const ratingValues = Object.values(ratingChanges);
    if (ratingValues.length !== 2) {
      throw new Error("Invalid ratingChanges format. Expected 2 values.");
    }

    // user1 is always winner and user2 is always loser.

    const winnerRatingChange = ratingChanges['user1'];
    if (winnerRatingChange === undefined) {
      throw new Error("Winner rating change not found in ratingChanges.");
    }

    // Fetch challenge
    const challenge = await UserChallenges.findById(challengeId);
    if (!challenge) {
      throw new Error("Challenge not found.");
    }

    const participants: string[] = challenge.players.map(player => player.user_id.toString());
    const loserId = participants.find((id) => id !== winnerId);
    if (!loserId) {
      throw new Error("Could not determine loser from participants.");
    }

    const loserRatingChange = ratingChanges["user2"];

    // Update challenge result
    await UserChallenges.findByIdAndUpdate(challengeId, {
      winner: winnerId,
      rating_change: {
        [winnerId]: winnerRatingChange,
        [loserId]: loserRatingChange,
      },
      active: false,
      status: "completed",
      $push: {
        codes: {
          user_id: winnerId,
          code: winnerCode,
          passed_test_cases: testcases,
        },
      },
    });

    const winnerStats = await UserStats.findOne({ user_id: winnerId }).select("rating");
    const currentWinnerRating = winnerStats?.rating || 0;

    // Update stats
    await Promise.all([
      UserStats.findOneAndUpdate(
        { user_id: winnerId },
        {
          $inc: { rating: winnerRatingChange, wins: 1, matches_played: 1 },
          $set: { last_match_date: new Date() },
          $max: { highest_rating: currentWinnerRating + winnerRatingChange },
        }
      ),
      UserStats.findOneAndUpdate(
        { user_id: loserId },
        {
          $inc: { rating: loserRatingChange, loss: 1, matches_played: 1 },
          $set: { last_match_date: new Date() },
        }
      ),
    ]);

    // Notify both players
    const notifyUser = (userId: string, isWinner: boolean, ratingChange: number) => {
      emitToUser(userId, "match_result", {
        code: isWinner ? 10 : 11,
        message: isWinner ? "You won the match! 🎉" : "You lost the match. Better luck next time! 💪",
        ratingChange,
      });
    };

    notifyUser(winnerId, true, winnerRatingChange);
    notifyUser(loserId, false, loserRatingChange);

    // Update user titles
    await updateUserTitleByRating(winnerId);
    await updateUserTitleByRating(loserId);

    return { message: "Challenge result submitted and ratings updated." };
  }

  static async getChallengeById(challengeId: string) {
    const challenge = await UserChallenges.findById(challengeId).populate({
      path: "problem_id",
      model: "Question",
    });

    if (!challenge) {
      throw new Error("Challenge not found.");
    }

    const playerIds = challenge.players.map((player) => player.user_id);
    const playerDetails = await UserStats.find({ user_id: { $in: playerIds } })
      .select("user_id matches_played rating wins draw loss")
      .populate({
        path: "user_id",
        select: "username email profileImage first_name last_name user_photo",
      });

    return {
      ...challenge.toObject(),
      playerDetails,
    };
  }
}
