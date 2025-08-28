import express, { RequestHandler, Router } from "express";
import {
  registerStudent,
  verifyUserUsingOtp,
} from "../controllers/user-controller";

const router: Router = express.Router();

// /api/v1/users

// student routes
router.post("/student/register", registerStudent);
router.post("/verify-otp", verifyUserUsingOtp);

export default router;
