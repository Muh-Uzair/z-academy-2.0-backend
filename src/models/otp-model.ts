import mongoose, { Schema, Document, Model } from "mongoose";
import { IOtp } from "../types/otp-types";

const OtpSchema: Schema<IOtp> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    otp: {
      type: Number,
      default: null,
      validate: {
        validator: (value: number | null) =>
          value === null || /^[0-9]{6}$/.test(String(value)),
        message: "OTP must be a 6-digit number",
      },
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
    },
  },
  { timestamps: true }
);

const OtpModel: Model<IOtp> =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);

export default OtpModel;
