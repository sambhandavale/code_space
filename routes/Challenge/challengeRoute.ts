import { Router } from "express";
import passport from "passport";

const router = Router();

import {
  joinMatchmaking,
  getAllChallenges,
  getChallengeById,
  leaveChallenge,
  leaveMatchmaking,
  askDrawChallenge,
  proxyPythonCompiler,
  proxyPythonTestCaseCompiler,
  submitChallengeResult,
  getChallengeStatus,
  runCodeWithTestCases,
  acceptDrawChallenge,
  rejectDrawChallenge,
} from "../../controllers/challenge/challengeController";

import {
  checkRoomStatus,
  createPrivateChallenge,
  joinPrivateChallenge,
} from "../../controllers/challenge/friendChallenge";

router.get("/", getAllChallenges);

router.get("/:id", getChallengeById);

router.get("/status/:challengeId", getChallengeStatus);

router.get("/room-status/:roomCode", checkRoomStatus);

router.post(
  "/joinMatchmaking",
  passport.authenticate("jwt", { session: false }),
  joinMatchmaking
);

router.post(
  "/leaveChallenge",
  passport.authenticate("jwt", { session: false }),
  leaveChallenge
);

router.post(
  "/askDrawChallenge",
  passport.authenticate("jwt", { session: false }),
  askDrawChallenge
);

router.post(
  "/acceptDrawChallenge",
  passport.authenticate("jwt", { session: false }),
  acceptDrawChallenge
);

router.post(
  "/rejectDrawChallenge",
  passport.authenticate("jwt", { session: false }),
  rejectDrawChallenge
);

router.post(
  "/stopMatchmaking",
  passport.authenticate("jwt", { session: false }),
  leaveMatchmaking
);

router.post(
  "/endChallenge",
  passport.authenticate("jwt", { session: false }),
  submitChallengeResult
);

router.post(
  "/submit-answer",
  passport.authenticate("jwt", { session: false }),
  proxyPythonTestCaseCompiler
);

router.post(
  "/submit-answer-new",
  passport.authenticate("jwt", { session: false }),
  runCodeWithTestCases
);

router.post(
  "/run-answer",
  passport.authenticate("jwt", { session: false }),
  proxyPythonCompiler
);

router.post(
  "/create-private",
  passport.authenticate("jwt", { session: false }),
  createPrivateChallenge
);

router.post(
  "/join-private",
  passport.authenticate("jwt", { session: false }),
  joinPrivateChallenge
);

export default router;
