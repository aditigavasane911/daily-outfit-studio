import { Router } from "express";
import {
  listGarments,
  getGarment,
  addGarment,
  editGarment,
  toggleFavorite,
  removeGarment,
} from "../controllers/garments.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listGarments);
router.post("/", addGarment);
router.get("/:id", getGarment);
router.put("/:id", editGarment);
router.patch("/:id/favorite", toggleFavorite);
router.delete("/:id", removeGarment);

export default router;
