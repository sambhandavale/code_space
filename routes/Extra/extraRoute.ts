import { Router } from "express";
import { wakeUp } from "../../controllers/extra/wakeup";

const router = Router()

router.route("/wakeup").get(wakeUp);

export default router;