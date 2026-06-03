import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import assetsRouter from "./assets";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/projects", projectsRouter);
router.use("/projects/:id/assets", assetsRouter);

export default router;
