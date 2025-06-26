import { getAll } from "../../utility/handlerFactory";
import Question from "../../models/Challenges/Question";

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
    });

    const summary = questions.map((q) => ({
      id: q._id,
      title: q.title,
      description: q.description,
      difficulty: q.difficulty,
      noOfPings: q.pings.length,
      noOfSubmits: q.submits.length,
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
  const userId = req.query.userId || "anonymous";
  const questionId = req.params.id;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
        res.status(404).json({ message: "Question not found" });
        return;
    }

    if (!question.submits.includes(userId)) {
      question.submits.push(userId);
      await question.save();
      res.status(200).json({ message: "Submit recorded"});
      return;
    }

    res.status(200).json({ message: "Already submitted"});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
