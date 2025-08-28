export enum UserType {
  STUDENT = "student",
  INSTRUCTOR = "instructor",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  userType: UserType;
  avatar?: string;
  bio?: string;

  // Instructor-specific
  institute?: string;
  specialization?: string;
  experience?: number;
}
