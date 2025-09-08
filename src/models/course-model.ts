import mongoose, { Schema, model } from "mongoose";
import { ICourse } from "../types/course-types";

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, default: "" },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      required: true,
    },

    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    price: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },

    thumbnail: { type: String },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CourseModel = model<ICourse>("Course", courseSchema);
