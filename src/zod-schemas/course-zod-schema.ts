import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional().default(""),

  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),

  instructorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid instructor ID"),

  price: z.number().min(0).default(0),

  thumbnail: z.string().url("Thumbnail must be a valid URL").optional(),
});

export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .optional(), // optional since you may not update it every time
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .optional(),
  level: z
    .enum(["beginner", "intermediate", "advanced"], {
      message:
        "Invalid course level. Choose beginner, intermediate, or advanced.",
    })
    .optional(),
  price: z
    .number({
      message: "Price must be a number",
    })
    .min(0, { message: "Price must be greater than or equal to 0" })
    .optional(),
  thumbnail: z
    .string()
    .url({ message: "Thumbnail must be a valid URL" })
    .optional(),
});
