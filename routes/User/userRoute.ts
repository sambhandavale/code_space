import { Router } from "express";
import { getAllUsers, getUserById, getUserStats, getUserRating } from "../../controllers/user/userController";
import passport from "passport";

const router = Router()

router.route("/").get(getAllUsers);
router.route("/details").get(getUserStats);
router.route("/:id").get(getUserById);
router.get(
    '/rating/:id',
    passport.authenticate("jwt", { session: false }),
    getUserRating
)

export default router; 