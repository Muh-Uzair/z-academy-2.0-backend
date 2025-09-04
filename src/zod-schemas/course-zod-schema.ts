import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional().default(""),

  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),

  instructorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid instructor ID"),

  price: z.number().min(0).default(0),

  thumbnail: z.string().url("Thumbnail must be a valid URL").optional(),
});
