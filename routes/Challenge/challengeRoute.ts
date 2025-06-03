import { Router } from "express";
const router = Router();

import { joinMatchmaking, getAllChallenges, getChallengeById, leaveChallenge,leaveMatchmaking, askDrawChallenge, proxyPythonCompiler, proxyPythonTestCaseCompiler, submitChallengeResult, getChallengeStatus, runCodeWithTestCases, acceptDrawChallenge, rejectDrawChallenge } from "../../controllers/challenge/challengeController";

router.post("/joinMatchmaking", joinMatchmaking);
router.route("/leaveChallenge").post(leaveChallenge);

router.route("/askDrawChallenge").post(askDrawChallenge);
router.route("/acceptDrawChallenge").post(acceptDrawChallenge);
router.route("/rejectDrawChallenge").post(rejectDrawChallenge);

router.route("/stopMatchmaking").post(leaveMatchmaking);
router.route("/endChallenge").post(submitChallengeResult);

router.route("/").get(getAllChallenges);
router.route("/:id").get(getChallengeById);

router.route("/submit-answer").post(proxyPythonTestCaseCompiler)
router.route("/submit-answer-new").post(runCodeWithTestCases)
router.route("/run-answer").post(proxyPythonCompiler)

router.route("/status/:challengeId").get(getChallengeStatus);

export default router;