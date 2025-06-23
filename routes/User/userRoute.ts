import { Router } from "express";
import { getAllUsers, getUserById, getUserStats, getUserRating, resetUserStats, getOnlineUsers } from "../../controllers/user/userController";
import passport from "passport";
import { getUserProfileDetails, updateUserProfile } from "../../controllers/user/userProfileController";

const router = Router()

router.route("/").get(getAllUsers);
router.route("/details").get(getUserStats);
router.get(
    '/profile',
    getUserProfileDetails,
);
router.get(
    "/resetStats",
    resetUserStats,
)
router.post(
    "/update-profile",
    passport.authenticate("jwt", { session: false }),
    updateUserProfile,
)
router.get(
    '/onlineUsers',
    getOnlineUsers
);
router.route("/:id").get(getUserById);
router.get(
    '/rating/:id',
    passport.authenticate("jwt", { session: false }),
    getUserRating
);


export default router; 