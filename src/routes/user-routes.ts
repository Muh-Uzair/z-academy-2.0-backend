import express, { RequestHandler, Router } from "express";
import {
  getCurrAuthUser,
  registerStudent,
  verifyUserUsingOtp,
} from "../controllers/user-controller";
import passportJwt from "../middlewares/passport-jwt";

const router: Router = express.Router();

// /api/v1/users

// student routes
router.post("/student/register", registerStudent);
router.post("/verify-otp", verifyUserUsingOtp);

// common routes
router.get(
  "/me",
  passportJwt.authenticate("jwt", { session: false }),
  getCurrAuthUser as RequestHandler
);

export default router;
