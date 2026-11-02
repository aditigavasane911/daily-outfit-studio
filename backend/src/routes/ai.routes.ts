import { Router } from "express";
import { getAiEngineStatus, generateOutfit } from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/status", getAiEngineStatus);
router.post("/recommend", generateOutfit);

export default router;
