import { Router } from "express";
import authRoutes from "./auth.routes.js";
import garmentsRoutes from "./garments.routes.js";
import outfitsRoutes from "./outfits.routes.js";
import profileRoutes from "./profile.routes.js";
import aiRoutes from "./ai.routes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/garments", garmentsRoutes);
apiRouter.use("/outfits", outfitsRoutes);
apiRouter.use("/profile", profileRoutes);
apiRouter.use("/ai", aiRoutes);

export default apiRouter;
