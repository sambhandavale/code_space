import { getAll } from "../../Utility/handlerFactory";
import Question from "../../Models/Challenges/Question";
import UserStats from "../../Models/Users/UserStats";
import mongoose, { ObjectId } from "mongoose";

export const getAllQuestions = getAll(Question);

export const getQuestionsById = async (req, res) => {
    try {
        const filter:any = { _id: req.params.id };
        const questions = await Question.find(filter);
        if (!questions.length) {
            return res.status(404).json({ message: "No questions found" });
        }
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getQuestionsByDifficulty = async (req, res) => {
    try {
        const difficulty = req.params.difficulty;
        if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
            return res.status(400).json({ message: "Invalid difficulty level" });
        }

        const questions = await Question.find({ difficulty });

        if (questions.length === 0) {
            return res.status(404).json({ message: "No questions found" });
        }

        res.status(200).json({ results: questions.length, questions });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const getQuestionSummary = async (req, res) => {
  try {
    const questions = await Question.find({}, {
      title: 1,
      description: 1,
      difficulty: 1,
      pings: 1,
      submits: 1,
      tags:1,
    });

    const summary = questions.map((q) => ({
      id: q._id,
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      noOfPings: q.pings.length,
      noOfSubmits: q.submits.length,
      tags:q.tags
    }));

    res.status(200).json({ results: summary.length, questions: summary });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updatePing = async (req, res) => {
  const { userId } = req.body;
  const { id: questionId } = req.params;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const index = question.pings.indexOf(userId);

    if (index !== -1) {
      // User already liked — remove (unlike)
      question.pings.splice(index, 1);
      await question.save();
      return res.status(200).json({ message: "Unliked", question });
    }

    // User not yet liked — add (like)
    question.pings.push(userId);
    await question.save();
    return res.status(200).json({ message: "Liked", question });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateSubmits = async (req, res) => {
  const userId = req.query.userId as string;
  const questionId = req.params.id;
  const { language } = req.body;

  // --- Validate input IDs ---
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid or missing userId" });
  }
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid question id" });
  }
  if (!language || typeof language !== "string") {
    return res.status(400).json({ message: "Language is required" });
  }

  try {
    // --- Update the Question's submits array ---
    const questionResult = await Question.updateOne(
      { _id: questionId },
      { $addToSet: { submits: userId } }
    );

    if (questionResult.matchedCount === 0) {
      return res.status(404).json({ message: "Question not found" });
    }

    // --- Update UserStats for questions_solved ---
    const userStats = await UserStats.findOne({ user_id: userId });

    if (!userStats) {
      return res.status(404).json({ message: "UserStats not found" });
    }

    const solvedQuestion = userStats.questions_solved?.find(
      (q) => q.question.toString() === questionId
    );

    if (solvedQuestion) {
      // Question exists, check if language already added
      if (!solvedQuestion.language.includes(language.trim())) {
        solvedQuestion.language.push(language.trim());
        await userStats.save();
      }
    } else {
      // Question not solved yet, add new entry
      userStats.questions_solved.push({
        question: new mongoose.Types.ObjectId(questionId) as unknown as ObjectId,
        language: [language.trim()],
        solved_at: new Date(),
      });
      await userStats.save();
    }

    const alreadySubmitted = questionResult.modifiedCount === 0;

    return res.status(200).json({
      message: alreadySubmitted
        ? "Already submitted; user stats updated if needed."
        : "Submit recorded and user stats updated.",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
