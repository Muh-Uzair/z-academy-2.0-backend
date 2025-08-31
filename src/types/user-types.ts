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
