import express, { RequestHandler, Router } from "express";
import { restrictedTo } from "../middlewares/restricted-to";
import { UserType } from "../types/user-types";
import { createEnrollment } from "../controllers/enrollments-controller";

const router: Router = express.Router();

// /api/v1/enrollments

router.post(
  "/",
  restrictedTo([`${UserType.STUDENT}`]) as unknown as RequestHandler,
  createEnrollment as RequestHandler
);

export default router;
