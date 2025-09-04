import express, { RequestHandler, Router } from "express";
import { createCourse } from "../controllers/course-controller";
import { restrictedTo } from "../middlewares/restricted-to";

const router: Router = express.Router();

// /api/v1/courses
router.post(
  "/",
  restrictedTo(["instructor"]) as unknown as RequestHandler,
  createCourse as RequestHandler
);

export default router;
