import express, { RequestHandler, Router } from "express";
import {
  getCurrAuthUser,
  loginUser,
  logoutUser,
  registerInstructor,
  registerStudent,
  verifyUserUsingOtp,
  googleRegisterCallback,
} from "../controllers/auth-controller";
import passportJwt from "../middlewares/passport-jwt";
import passportGoogle from "../middlewares/passport-google";

const router: Router = express.Router();

// /api/v1/users

// student routes
router.post("/student/register", registerStudent);
router.post("/verify-otp", verifyUserUsingOtp);

// instructor routes
router.post("/instructor/register", registerInstructor);

// common routes
router.get(
  "/me",
  passportJwt.authenticate("jwt", { session: false }),
  getCurrAuthUser as RequestHandler
);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// google
router.get("/google", (req, res, next) => {
  // stash userType temporarily in the state param
  const userType = req.query.userType as string;
  const login = req.query.login as string;

  let state;

  if (login === "true") {
    state = "login=true";
  } else {
    state = userType === "student" ? `userType=student` : `userType=instructor`;
  }

  passportGoogle.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passportGoogle.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/google-auth-error`,
  }),
  googleRegisterCallback as any
);

export default router;
