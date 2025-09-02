import { Router } from "express";

const router = Router();

import { userSigninValidator,userSignupValidator, runValidation } from "../../Controllers/Validators/auth";
import { signup, signin, confirmEmail } from "../../Controllers/Authentication/authLocal";

router.post("/signup", userSigninValidator, runValidation, signup);
router.post("/signin", userSigninValidator, runValidation, signin);
router.post("/confirm-email", confirmEmail);


export default router;