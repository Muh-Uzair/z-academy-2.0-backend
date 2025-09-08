import express, { RequestHandler, Router } from "express";
import {
  createCourse,
  getAllCoursesBasedOnInstructor,
  getCourseOnId,
  updateCourseOnId,
} from "../controllers/course-controller";
import { restrictedTo } from "../middlewares/restricted-to";

const router: Router = express.Router();

// /api/v1/courses
router.post(
  "/",
  restrictedTo(["instructor"]) as unknown as RequestHandler,
  createCourse as RequestHandler
);

// fetches courses that are based on instructor id
router.get(
  "/instructor",
  restrictedTo(["instructor"]) as unknown as RequestHandler,
  getAllCoursesBasedOnInstructor as RequestHandler
);

router.get("/:id", getCourseOnId);

router.patch(
  "/:id",
  restrictedTo(["instructor"]) as unknown as RequestHandler,
  updateCourseOnId
);

export default router;
