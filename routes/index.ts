import { Response, Express } from "express";
import passport from "passport";

import authRouter from "./Auth/authRoute";
import challengeRouter from "./Challenge/challengeRoute";
import userRouter from "./User/userRoute";
import questionRouter from "./Questions/questionsRoute";

export const routes = (app: Express) =>{
    app.use("/api/auth", authRouter);
    app.use(
        "/api/challenge",
        passport.authenticate("jwt", { session: false }),
        challengeRouter,
    );
    app.use('/api/users', userRouter);
    app.use('/api/questions',questionRouter);
}