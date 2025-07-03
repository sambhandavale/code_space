import { Router } from "express";

const router = Router();

import { userSigninValidator,userSignupValidator, runValidation } from "../../controllers/validators/auth";
import { signup, signin, confirmEmail } from "../../controllers/authentication/authLocal";

router.post("/signup", userSigninValidator, runValidation, signup);
router.post("/signin", userSigninValidator, runValidation, signin);
router.post("/confirm-email", confirmEmail);


export default router;