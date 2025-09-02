import UserChallenges from "../../Models/Challenges/User-Challenges";
import Question from "../../Models/Challenges/Question";
import UserStats from "../../Models/Users/UserStats";
import { updateUserTitleByRating } from "../../Utility/User/updateUserTitle";
import { emitToUser } from "../../Controllers/Challenge/challengeController";

export class ChallengeService {
  static async getChallengeStatus(challengeId: string) {
    const challenge = await UserChallenges.findById(challengeId);

    if (!challenge) throw new Error("Challenge not found");

    const now = new Date();
    const elapsed = (now.getTime() - challenge.start_time.getTime()) / 1000;
    const total = challenge.time * 60;
    const remaining = Math.max(total - elapsed, 0);

    return {
      challengeId: challenge._id,
      remainingTime: remaining,
      problemId: challenge.problem_id,
      players: challenge.players,
    };
  }

  static async leaveChallenge(challengeId: string, userId: string) {
    const challenge = await UserChallenges.findById(challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (!challenge.active) throw new Error("Challenge is already ended");

    const problem = await Question.findById(challenge.problem_id).select("difficulty");
    if (!problem) throw new Error("Problem not found");

    const [player1, player2] = challenge.players;
    const winnerId = player1.user_id.toString() === userId ? player2.user_id : player1.user_id;

    const ratingChange =
      problem.difficulty === "Easy" ? 6 :
      problem.difficulty === "Medium" ? 8 : 10;

    const winnerIdStr = winnerId.toString();
    const userIdStr = userId.toString();

    await UserChallenges.findByIdAndUpdate(challengeId, {
      winner: winnerId,
      rating_change: { [winnerIdStr]: ratingChange, [userIdStr]: -ratingChange },
      active: false,
      status: "completed",
    });

    const winnerStats = await UserStats.findOne({ user_id: winnerId }).select("rating");
    const currentWinnerRating = winnerStats?.rating || 0;

    await Promise.all([
      UserStats.findOneAndUpdate(
        { user_id: winnerId },
        {
          $inc: { rating: ratingChange, wins: 1 },
          $max: { highest_rating: currentWinnerRating + ratingChange },
        }
      ),
      UserStats.findOneAndUpdate(
        { user_id: userId },
        { $inc: { rating: -ratingChange, loss: 1 } }
      ),
    ]);

    emitToUser(winnerIdStr, "match_result", {
      code: 30,
      message: "Your opponent left the match! You win! 🎉",
      ratingChange,
    });

    emitToUser(userIdStr, "match_result", {
      code: 31,
      message: "You left the match. Your opponent wins by default. ❌",
      ratingChange: -ratingChange,
    });

    await updateUserTitleByRating(winnerIdStr);
    await updateUserTitleByRating(userIdStr);

    return { message: "Match forfeited. Opponent declared winner." };
  }

  static async acceptDrawChallenge(challengeId: string, timeup?: boolean) {
    const challenge = await UserChallenges.findById(challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (!challenge.active) throw new Error("Challenge already ended");

    const problem = await Question.findById(challenge.problem_id).select("difficulty");
    if (!problem) throw new Error("Problem not found");

    const [player1, player2] = challenge.players;
    const player1Str = player1.user_id.toString();
    const player2Str = player2.user_id.toString();

    const fullRating = problem.difficulty === "Easy" ? 6 :
                       problem.difficulty === "Medium" ? 8 : 10;
    const drawRating = Math.floor(fullRating / 2);
    const finalDrawRating = timeup ? 0 : drawRating;

    await UserChallenges.findByIdAndUpdate(challengeId, {
      winner: null,
      rating_change: { [player1Str]: finalDrawRating, [player2Str]: finalDrawRating },
      active: false,
      draw: true,
      status:"completed"
    });

    if (!timeup) {
      const [p1Stats, p2Stats] = await Promise.all([
        UserStats.findOne({ user_id: player1Str }),
        UserStats.findOne({ user_id: player2Str }),
      ]);

      await Promise.all([
        UserStats.findOneAndUpdate(
          { user_id: player1Str },
          { $inc: { rating: drawRating, draws: 1 }, $max: { highest_rating: (p1Stats?.rating || 0) + drawRating } }
        ),
        UserStats.findOneAndUpdate(
          { user_id: player2Str },
          { $inc: { rating: drawRating, draws: 1 }, $max: { highest_rating: (p2Stats?.rating || 0) + drawRating } }
        ),
      ]);

      await updateUserTitleByRating(player1Str);
      await updateUserTitleByRating(player2Str);
    }

    emitToUser(player1Str, "match_result", {
      code: 40,
      message: timeup ? "The match ended in a draw due to time up! ⏱️" : "The match ended in a draw! 🤝",
      ratingChange: finalDrawRating,
    });

    emitToUser(player2Str, "match_result", {
      code: 40,
      message: timeup ? "The match ended in a draw due to time up! ⏱️" : "The match ended in a draw! 🤝",
      ratingChange: finalDrawRating,
    });

    return {
      message: timeup ? "Match ended in a draw due to time up. No ratings updated." : "Match ended in a draw. Ratings updated.",
    };
  }

  static async askDrawChallenge(challengeId: string, userId: string) {
    const challenge = await UserChallenges.findById(challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (!challenge.active) throw new Error("Challenge already ended");

    const [p1, p2] = challenge.players;
    const p1Str = p1.user_id.toString();
    const p2Str = p2.user_id.toString();
    const opponentId = userId === p1Str ? p2Str : p1Str;

    emitToUser(opponentId, "ask_draw", { code: 41, message: "Opponent is asking for a draw" });

    return { message: "Draw request sent to opponent." };
  }

  static async rejectDrawChallenge(challengeId: string, userId: string) {
    const challenge = await UserChallenges.findById(challengeId);
    if (!challenge) throw new Error("Challenge not found");
    if (!challenge.active) throw new Error("Challenge already ended");

    const [p1, p2] = challenge.players;
    const p1Str = p1.user_id.toString();
    const p2Str = p2.user_id.toString();
    const opponentId = userId === p1Str ? p2Str : p1Str;

    emitToUser(opponentId, "reject_draw", { code: 41, message: "Opponent has rejected the draw request" });

    return { message: "Draw rejected" };
  }
}
