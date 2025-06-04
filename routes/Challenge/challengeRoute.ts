import { Router } from "express";
const router = Router();

import { joinMatchmaking, getAllChallenges, getChallengeById, leaveChallenge,leaveMatchmaking, askDrawChallenge, proxyPythonCompiler, proxyPythonTestCaseCompiler, submitChallengeResult, getChallengeStatus, runCodeWithTestCases, acceptDrawChallenge, rejectDrawChallenge } from "../../controllers/challenge/challengeController";
import { checkRoomStatus, createPrivateChallenge, joinPrivateChallenge } from "../../controllers/challenge/friendChallenge";

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

router.post("/create-private", createPrivateChallenge); // host creates challenge with room code
router.post("/join-private", joinPrivateChallenge);     // friend joins with room code
router.get("/room-status/:roomCode", checkRoomStatus);  // poll status of the room(non-socket)

export default router;