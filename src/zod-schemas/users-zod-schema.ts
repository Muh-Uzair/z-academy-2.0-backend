import { z } from "zod";

export const registerInstructorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must not exceed 100 characters"),
  institute: z
    .string()
    .min(2, "Institute name must be at least 2 characters long"),
  specialization: z
    .string()
    .min(2, "Specialization must be at least 2 characters long"),
  experience: z
    .number({ error: "Experience must be a number" })
    .min(0, "Experience cannot be negative"),
});
