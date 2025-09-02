import { Router } from "express";

const router = Router();

import { userSigninValidator,userSignupValidator, runValidation } from "../../Controllers/Validators/auth";
import { signup, signin, confirmEmail, forgotPassword, resetPassword } from "../../Controllers/Authentication/authLocal";

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/signin", userSigninValidator, runValidation, signin);
router.post("/confirm-email", confirmEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router; 