import { Router } from "express";
import {
  listSavedOutfits,
  saveOutfit,
  removeSavedOutfit,
} from "../controllers/outfits.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/saved", listSavedOutfits);
router.post("/saved", saveOutfit);
router.delete("/saved/:id", removeSavedOutfit);

export default router;
