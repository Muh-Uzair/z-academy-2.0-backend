import mongoose, { Schema, model } from "mongoose";
import { IEnrollment } from "../types/enrollment-types";

const enrollmentSchema = new Schema<IEnrollment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    status: {
      type: String,
      enum: ["enrolled", "completed", "dropped"],
      default: "enrolled",
    },

    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicate enrollments (same student enrolling in same course twice)
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const EnrollmentModel = model<IEnrollment>(
  "Enrollment",
  enrollmentSchema
);
