/* eslint-disable */

import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "mongo-sanitize";
import authRouter from "./routes/auth-routes";
import userRouter from "./routes/user-routes";
import coursesRouter from "./routes/course-routes";
import enrollmentsRouter from "./routes/enrollments-routes";
import passportJwt from "./middlewares/passport-jwt";
import passportGoogle from "./middlewares/passport-google";
import { globalErrorHandler } from "./controllers/error-controller";

dotenv.config({ path: "./config.env", quiet: true });

const app = express();

// http headers security
app.use(helmet());

// body parsing
app.use(express.json({ limit: "10kb" }));

// cookie parser
app.use(cookieParser());

// parameter pollution to remove duplicate query params
app.use(hpp({}));

// setting cors
app.use(
  cors({
    origin: process.env.CLIENT_URLs,
    credentials: true,
  })
);

app.use(cookieParser());

// logger in dev mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.set("trust proxy", true);

// limiting request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 30 * 60 * 1000,
  message: "Too many requests.",
  validate: { trustProxy: false },
});
app.use(limiter);

// sanitizing against sql query injection
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    for (const key in req.body) {
      req.body[key] = mongoSanitize(req.body[key]);
    }
  }

  if (req.params) {
    for (const key in req.params) {
      req.params[key] = mongoSanitize(req.params[key]);
    }
  }

  if (req.query) {
    for (const key in req.query) {
      req.query[key] = mongoSanitize(req.query[key]);
    }
  }

  next();
});

// cron jobs

// passport strategies
app.use(passportJwt.initialize());
app.use(passportGoogle.initialize());

// rotes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to z-academy backend.",
  });
});

app.use(() => {
  console.log("Hello");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/enrollments", enrollmentsRouter);

// Handle unknown routes (404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "fail",
    message: `Cannot find ${req.originalUrl} on this server.`,
  });
});

// handling errors globally
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  globalErrorHandler(err, req, res);
});

export default app;
