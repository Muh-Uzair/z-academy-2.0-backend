import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser, UserType } from "../types/user-types";

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },
    avatar: { type: String },
    bio: { type: String },

    // Instructor-only fields
    institute: {
      type: String,
      required: function () {
        return this.userType === UserType.INSTRUCTOR;
      },
    },
    specialization: {
      type: String,
      required: function () {
        return this.userType === UserType.INSTRUCTOR;
      },
    },
    experience: {
      type: Number,
      min: 0,
      required: function () {
        return this.userType === UserType.INSTRUCTOR;
      },
    },
  },
  { timestamps: true }
);

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
