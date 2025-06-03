import { Router } from "express";
import { getAllUsers, getUserById, getUserDetailsById, getUserRating } from "../../controllers/user/userController";

const router = Router()

router.route("/").get(getAllUsers);
router.route("/:id").get(getUserById);
router.route("/details/:id").get(getUserDetailsById);
router.route("/rating/:id").get(getUserRating);

export default router; 