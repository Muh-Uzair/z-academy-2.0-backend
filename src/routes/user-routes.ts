import express, { RequestHandler, Router } from "express";
import {
  getInstructorProfile,
  getStudentsOnInstructorId,
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

export default router;
