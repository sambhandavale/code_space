import { Router } from "express";
import { getAllUsers, getUserById, getUserDetailsById } from "../../controllers/user/userController";

const router = Router()

router.route("/").get(getAllUsers);
router.route("/:id").get(getUserById);
router.route("/details/:id").get(getUserDetailsById);

export default router; 