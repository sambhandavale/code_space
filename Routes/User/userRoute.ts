import { Router } from "express";
import { getAllUsers, getUserById, getUserStats, getUserRating, resetUserStats, getOnlineUsers } from "../../Controllers/User/userController";
import passport from "passport";
import { getUserProfileDetails, updateUserProfile, uploadProfileImage } from "../../Controllers/User/userProfileController";
import multer from "multer";

const router = Router()
const upload = multer();

router.route("/").get(getAllUsers);
router.route("/details").get(getUserStats); 
router.get(
    '/profile',
    getUserProfileDetails,
);

router.post(
  "/upload-profile-image",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  uploadProfileImage
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