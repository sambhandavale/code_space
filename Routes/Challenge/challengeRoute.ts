import { Router } from "express";
import passport from "passport";

import * as challengeCtrl from "../../Controllers/Challenge/challengeController";
import * as friendCtrl from "../../Controllers/Challenge/friendChallenge";
import * as resultCtrl from "../../Controllers/Challenge/resultController";
import * as matchCtrl from "../../Controllers/Challenge/matchmakingController";
import * as codeCtrl from "../../Controllers/Challenge/codeExecutionController";

const router = Router();
const auth = passport.authenticate("jwt", { session: false });

// --- General ---
router.get("/", challengeCtrl.getAllChallenges);
router.get("/:id", resultCtrl.getChallengeById);
router.get("/status/:challengeId", challengeCtrl.getChallengeStatus);
router.get("/room-status/:roomCode", friendCtrl.checkRoomStatus);

// --- Matchmaking ---
router.post("/joinMatchmaking", auth, matchCtrl.joinMatchmaking);
router.post("/stopMatchmaking", auth, matchCtrl.leaveMatchmaking);

// --- Draw Requests ---
router.post("/askDrawChallenge", auth, challengeCtrl.askDrawChallenge);
router.post("/acceptDrawChallenge", auth, challengeCtrl.acceptDrawChallenge);
router.post("/rejectDrawChallenge", auth, challengeCtrl.rejectDrawChallenge);

// --- Code Execution ---
router.post("/submit-code", auth, codeCtrl.runCodeWithTestCases);
router.post("/submit/code", auth, codeCtrl.submitCode);
router.get("/code/status/:jobId", auth, codeCtrl.getJobResult);

// --- Challenge Actions ---
router.post("/leaveChallenge", auth, challengeCtrl.leaveChallenge);
router.post("/endChallenge", auth, resultCtrl.submitChallengeResult);

// --- Private Challenges ---
router.post("/create-private", auth, friendCtrl.createPrivateChallenge);
router.post("/join-private", auth, friendCtrl.joinPrivateChallenge);

export default router;