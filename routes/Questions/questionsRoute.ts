import { Router } from "express";
import { getAllQuestions, getQuestionsById, getQuestionsByDifficulty } from "../../controllers/Questions/QuestionsController";

const router = Router();

router.route('/').get(getAllQuestions);
router.route('/:id').get(getQuestionsById);
router.route('/difficulty/:difficulty').get(getQuestionsByDifficulty);

export default router;