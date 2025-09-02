import { Router } from "express";
import { wakeUp } from "../../Controllers/Extra/wakeup";

const router = Router()

router.route("/wakeup").get(wakeUp);

export default router;