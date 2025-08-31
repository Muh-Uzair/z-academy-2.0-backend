import UserModel from "../models/user-model";
import OtpModel from "../models/otp-model";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { generateOTP } from "../utils/generate-otp";
import { sendMail } from "../utils/email";
import { IUser, UserType } from "../types/user-types";
import bcrypt from "bcrypt";
import { registerInstructorSchema } from "../zod-schemas/users-zod-schema";
import { Types } from "mongoose";

export interface RequestWithUser extends Request {
  user?: IUser;
}

interface CustomRequest extends Request {
  userType: string;
  user: IUser & { _id: Types.ObjectId };
}

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

    // check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return next(new AppError("User already exists. Please login.", 400));
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

    // 5 : check if otp is expired or invalid
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      await OtpModel.findByIdAndDelete(otpDoc?._id);
      throw new AppError("OTP invalid or expired", 400);
    }

    // 6 : signup the client, create a document in user collection and send a jwt
    let user = null;
    if (userType === "student") {
      const { name, email, password } = otpDoc;

      user = await UserModel.create({
        name,
        email,
        password,
        userType,
      });
    }

    if (userType === "instructor") {
      const { name, email, password, institute, specialization, experience } =
        otpDoc;

      user = await UserModel.create({
        name,
        email,
        password,
        userType,
        institute,
        specialization,
        experience,
      });
    }

    user = user?.toObject() as any;

    // 7 : preparation for jwt
    const jwtSecret: string = process.env.JWT_SECRET!;
    const jwtExpiresIn: number =
      Number(process.env.JWT_EXPIRES_IN) || 259200000;

    const signOptions: SignOptions = {
      expiresIn: jwtExpiresIn,
    };

    // 8 : sign token
    const token = jwt.sign({ id: String(user._id) }, jwtSecret, signOptions);

    // 9 : once the user is created the otp document should be deleted
    await OtpModel.findByIdAndDelete(otpDoc?._id);

    //  10 : set JWT in cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    // 11 : return response
    return res.status(200).json({
      status: "success",
      message: "Student register success",
      data: {
        user,
        jwt: token, // still sending in body too (optional)
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

// FUNCTION
export const getCurrAuthUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: {
        user: req.user,
      },
    });
  } catch (err) {
    return next(err);
  }
};

// FUNCTION
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : take email and password out
    const { email, password } = req.body;

    // 2 : check if something is missing
    if (!email || !password) {
      throw new AppError("Missing credentials email or password", 400);
    }

    // 3 : find user for that email
    const user = await UserModel.findOne({ email }).select("+password");

    // 4 : compare the password
    const passwordCorrect = user?.password
      ? await bcrypt.compare(password, user?.password)
      : false;

    // 5 : check both buildManager and passwords are correct or not
    if (!user || !passwordCorrect) {
      return next(new AppError("Wrong email or password", 401));
    }

    // 6 : sign a jwt, create a jwt
    const jwtSecret: string = process.env.JWT_SECRET!;
    const jwtExpiresIn: number =
      Number(process.env.JWT_EXPIRES_IN) || 259200000;

    const signOptions: SignOptions = {
      expiresIn: jwtExpiresIn,
    };

    const token = jwt.sign(
      { id: String(user._id) }, // always cast ObjectId to string
      jwtSecret,
      signOptions
    );

    // 7 : send the cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "User login success",
      data: {
        user,
        jwt: token,
      },
    });
  } catch (error: unknown) {
    return next(error);
  }
};

// FUNCTION
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 👇 replace "jwt" with your actual cookie name
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: unknown) {
    return next(error);
  }
};

// FUNCTION
export const registerInstructor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : validate request body
    const parsedData = registerInstructorSchema.parse({
      ...req.body,
      experience: parseInt(req.body.experience),
    });

    // 2 : destructure fields after validation
    const { name, email, password, institute, specialization, experience } =
      parsedData;

    // 3 : check if user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return next(new AppError("User already exists. Please login.", 400));
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

    // 6 : create a document in otp collection to store the information of user
    const optDoc = await OtpModel.create({
      name,
      email,
      password,
      institute,
      specialization,
      experience,
      otp: Number(otp),
    });

    if (!optDoc) {
      throw new AppError("Unable to create otp", 500);
    }

    res.status(200).json({
      status: "success",
      message: "Otp sent to instructor email",
    });
  } catch (error: unknown) {
    return next(error);
  }
};

export const googleRegisterCallback = (req: CustomRequest, res: Response) => {
  // 1 : take the user from request
  const user = req.user;

  // 2: : sign a jwt, create a jwt
  const jwtSecret: string = process.env.JWT_SECRET!;
  const jwtExpiresIn: number = Number(process.env.JWT_EXPIRES_IN) || 259200000;

  const signOptions: SignOptions = {
    expiresIn: jwtExpiresIn,
  };

  const token = jwt.sign(
    { id: String(user._id) }, // always cast ObjectId to string
    jwtSecret,
    signOptions
  );

  // 3 : send the cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  // 4 : Redirect back to frontend with token + user info in query
  return res.redirect(
    `${process.env.CLIENT_URL}/google-auth-success?token=${token}&userType=${user?.userType}`
  );
};
