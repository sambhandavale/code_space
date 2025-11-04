import { Router } from "express";
import * as questionsController from "../../Controllers/Questions/questionsController";

const router = Router();

router.route('/').get(questionsController.getAllQuestions);
router.get('/questionList',questionsController.getQuestionSummary)
router.route('/:id').get(questionsController.getQuestionsById);
router.route('/difficulty/:difficulty').get(questionsController.getQuestionsByDifficulty);
router.route('/:id/ping').patch(questionsController.updatePing);
router.route('/:id/submit').patch(questionsController.updateSubmits);

router.post('/add',questionsController.addQuestion);

export default router;