import { Document, Types } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description?: string;
  level: "beginner" | "intermediate" | "advanced";

  instructorId: Types.ObjectId;
  enrolledStudentsIds: Types.ObjectId[];

  price: number;
  enrollmentCount: number;

  thumbnail?: string;
  rating: number;
}
