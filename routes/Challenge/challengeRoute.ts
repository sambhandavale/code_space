import { Router } from "express";
const router = Router();

import { joinMatchmaking, getAllChallenges, getChallengeById, leaveChallenge,leaveMatchmaking } from "../../controllers/challenge/challengeController";

router.post("/joinMatchmaking", joinMatchmaking);
router.route("/leaveChallenge").post(leaveChallenge);
router.route("/stopMatchmaking").post(leaveMatchmaking);

router.route("/").get(getAllChallenges);
router.route("/:id").get(getChallengeById);

export default router;