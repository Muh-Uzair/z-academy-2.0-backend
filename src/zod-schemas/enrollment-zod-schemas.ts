import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const enrollmentSchema = z.object({
  studentId: z
    .string()
    .regex(
      objectIdRegex,
      "Invalid studentId, must be a valid MongoDB ObjectId"
    ),
  courseId: z
    .string()
    .regex(objectIdRegex, "Invalid courseId, must be a valid MongoDB ObjectId"),
});
