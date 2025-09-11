import { Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: "enrolled" | "completed" | "dropped";
  enrolledAt: Date;
  completedAt?: Date;
}
