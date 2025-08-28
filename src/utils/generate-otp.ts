import crypto from "crypto";

export function generateOTP(): string {
  // Generate a random integer between 100000` and 999999
  const otp = crypto.randomInt(100000, 1000000);
  return otp.toString();
}
