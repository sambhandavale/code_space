import { Router } from "express";
const router = Router();

import { joinMatchmaking, getAllChallenges, getChallengeById, leaveChallenge,leaveMatchmaking, drawChallenge, proxyPythonCompiler, proxyPythonTestCaseCompiler, submitChallengeResult, getChallengeStatus } from "../../controllers/challenge/challengeController";

router.post("/joinMatchmaking", joinMatchmaking);
router.route("/leaveChallenge").post(leaveChallenge);
router.route("/drawChallenge").post(drawChallenge);
router.route("/stopMatchmaking").post(leaveMatchmaking);
router.route("/endChallenge").post(submitChallengeResult);

router.route("/").get(getAllChallenges);
router.route("/:id").get(getChallengeById);

router.route("/submit-answer").post(proxyPythonTestCaseCompiler)
router.route("/run-answer").post(proxyPythonCompiler)
router.route("/status/:challengeId").get(getChallengeStatus);

export default router;