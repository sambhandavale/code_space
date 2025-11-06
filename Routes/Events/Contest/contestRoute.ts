import { Router } from "express";
import passport from "passport";
import * as contestController from "../../../Controllers/Events/Contest/contestController"

const router = Router()

router.post("/create", contestController.createContest);


export default router; 