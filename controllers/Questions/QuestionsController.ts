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