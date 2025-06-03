import { Router } from "express";
import { getAllUsers, getUserById, getUserDetailsById, getUserRating } from "../../controllers/user/userController";
import passport from "passport";

const router = Router()

router.route("/").get(getAllUsers);
router.route("/:id").get(getUserById);
router.route("/details/:id").get(getUserDetailsById);
router.get(
    '/rating/:id',
    passport.authenticate("jwt", { session: false }),
    getUserRating
)

export default router; 