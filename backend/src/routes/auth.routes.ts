import { Router } from "express";
import { getCurrentUser } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/me", getCurrentUser);

export default router;
