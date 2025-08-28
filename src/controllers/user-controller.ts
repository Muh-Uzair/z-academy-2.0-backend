import UserModel from "../models/user-model";
import OtpModel from "../models/otp-model";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { generateOTP } from "../utils/generate-otp";
import { sendMail } from "../utils/email";
import { UserType } from "../types/user-types";

// This sends an otp
export const registerStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : take data from req.body
    const { name, email, password } = req.body;

    // 2 : check wether necessary data is present
    if (!name || !email || !password) {
      return next(
        new AppError("Please provide name, email and password.", 400)
      );
    }

    // 3 : generate otp
    const otp = generateOTP();

    // 4 : send otp to student email
    const result = await sendMail(email, Number(otp));

    // 5 : if email not send then show error
    if (!result?.success) {
      return next(
        new AppError(
          "There was an error sending email. Please try again later.",
          500
        )
      );
    }

    // 6 : if otp send successfully then create an otp document
    await OtpModel.create({
      name,
      email,
      password,
      otp: Number(otp),
    });

    return res.status(201).json({
      status: "success",
      message: "Otp send to student email.",
    });
  } catch (error) {
    return next(error);
  }
};

// FUNCTION
export const verifyUserUsingOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : take otp and userType out of request body
    let { otp } = req.body;
    const { userType } = req.query;

    // 2 : check if otp exists
    if (
      !otp &&
      userType !== UserType.INSTRUCTOR &&
      userType !== UserType.STUDENT
    ) {
      throw new AppError("Otp not provided or wrong user type", 400);
    }

    // 3 : convert the otp into number
    otp = Number(otp);

    // 4 : find the document against the concerned otp
    const otpDoc = await OtpModel.findOne({ otp });

    // 6 : check if otp is expired or invalid
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      await OtpModel.findByIdAndDelete(otpDoc?._id);
      throw new AppError("OTP invalid or expired", 400);
    }

    // 7 : signup the client, create a document in user collection and send a jwt
    const { name, email, password } = otpDoc;

    let user = await UserModel.create({
      name,
      email,
      password,
      userType,
    });

    user = user.toObject() as any;

    // 8 : preparation for jwt
    const jwtSecret: string = process.env.JWT_SECRET!;
    const jwtExpiresIn: number =
      Number(process.env.JWT_EXPIRES_IN) || 259200000;

    const signOptions: SignOptions = {
      expiresIn: jwtExpiresIn,
    };

    // 9 : sign token
    const token = jwt.sign({ id: String(user._id) }, jwtSecret, signOptions);

    // 1 : once the user is created the otp document should be deleted
    await OtpModel.findByIdAndDelete(otpDoc?._id);

    // 12 : return response
    return res.status(200).json({
      status: "success",
      message: "Supplier sign up success",
      data: {
        user,
        jwt: token,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};
