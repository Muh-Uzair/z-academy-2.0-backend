import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser, UserType } from "../types/user-types";
import bcrypt from "bcrypt";

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    userType: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },
    bio: { type: String, default: "" },

    // Instructor-only fields
    institute: {
      type: String,

      default: "",
    },
    specialization: {
      type: String,

      default: "",
    },
    experience: {
      type: Number,
      min: 0,

      default: 0,
    },

    // google
    avatar: { type: String, default: "" },
    googleId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete (ret as any).password;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.password) return next();
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
