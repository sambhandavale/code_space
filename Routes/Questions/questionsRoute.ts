import { Router } from "express";
import { getAllQuestions, getQuestionsById, getQuestionsByDifficulty, updatePing, updateSubmits, getQuestionSummary } from "../../Controllers/Questions/questionsController";

const router = Router();

router.route('/').get(getAllQuestions);
router.get('/questionList',getQuestionSummary)
router.route('/:id').get(getQuestionsById);
router.route('/difficulty/:difficulty').get(getQuestionsByDifficulty);
router.route('/:id/ping').patch(updatePing);
router.route('/:id/submit').patch(updateSubmits);

export default router;