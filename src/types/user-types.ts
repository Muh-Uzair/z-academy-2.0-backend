import { Request } from "express";
import { Document, Types } from "mongoose";

export enum UserType {
  STUDENT = "student",
  INSTRUCTOR = "instructor",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  userType: UserType;

  bio?: string;

  // Instructor-specific
  institute?: string;
  specialization?: string;
  experience?: number;

  // google
  avatar?: string;
  googleId?: string;
}

export interface RequestWithUser extends Request {
  user?: IUser;
}

export interface RequestWithUserAndUserType extends Request {
  userType: string;
  user: IUser & { _id: Types.ObjectId };
}
