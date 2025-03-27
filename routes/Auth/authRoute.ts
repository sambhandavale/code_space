import { Router } from "express";

const router = Router();

import { userSigninValidator,userSignupValidator, runValidation } from "../../controllers/validators/auth";
import { signup, signin } from "../../controllers/authentication/authLocal";

router.post("/signup", userSigninValidator, runValidation, signup);
router.post("/signin", userSigninValidator, runValidation, signin);

export default router;