import express, { RequestHandler, Router } from "express";
import {
  getInstructorProfile,
  getStudentsOnInstructorId,
  updateInstructorProfile,
  getStudentProfile,
  updateStudentProfile,
} from "../controllers/user-controller";
import { restrictedTo } from "../middlewares/restricted-to";
import { UserType } from "../types/user-types";

const router: Router = express.Router();

// /api/v1/users

router.get(
  "/student/on-instructor-id",
  restrictedTo([UserType.INSTRUCTOR]) as unknown as RequestHandler,
  getStudentsOnInstructorId as RequestHandler
);

router.get(
  "/instructor/profile",
  restrictedTo([UserType.INSTRUCTOR]) as unknown as RequestHandler,
  getInstructorProfile as RequestHandler
);

router.patch(
  "/instructor/profile",
  restrictedTo([UserType.INSTRUCTOR]) as unknown as RequestHandler,
  updateInstructorProfile as RequestHandler
);

router.get(
  "/student/profile",
  restrictedTo([UserType.STUDENT]) as unknown as RequestHandler,
  getStudentProfile as RequestHandler
);

router.patch(
  "/student/profile",
  restrictedTo([UserType.STUDENT]) as unknown as RequestHandler,
  updateStudentProfile as RequestHandler
);

export default router;
