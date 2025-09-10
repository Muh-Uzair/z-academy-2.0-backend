import { NextFunction, Request, RequestHandler, Response } from "express";
import { IResponseObject } from "../types/response-object";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../zod-schemas/course-zod-schema";
import { RequestWithUser } from "../types/user-types";
import { CourseModel } from "../models/course-model";
import mongoose from "mongoose";

export const createCourse = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : take necessary fields out
    const { title, description, level, price, thumbnail } = req.body;

    const parsed = createCourseSchema.parse({
      title,
      description,
      level,
      instructorId: req.user?._id?.toString(),
      price: parseInt(price),
      thumbnail,
    });

    const course = await CourseModel.create(parsed);

    const responseObject: IResponseObject = {
      status: "success",
      message: "Course creation success",
      data: {
        course,
      },
    };

    return res.status(200).json(responseObject);
  } catch (error: unknown) {
    return next(error);
  }
};

export const getAllCoursesBasedOnInstructor = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses = await CourseModel.find({ instructorId: req.user?.id });

    const responseObject: IResponseObject = {
      status: "success",
      message: "Get all courses success",
      data: {
        courses,
      },
    };

    res.status(200).json(responseObject);
  } catch (error: unknown) {
    next(error);
  }
};

export const getCourseOnId: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail", // match your IResponseObject type
        message: "Course ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid course ID format",
      });
    }

    const course = await CourseModel.findById(id).populate(
      "instructorId",
      "name email bio institute specialization experience avatar"
    );

    if (!course) {
      return res.status(404).json({
        status: "fail",
        message: "Course not found",
      });
    }

    const responseObject: IResponseObject = {
      status: "success",
      message: "Course fetched successfully",
      data: { course },
    };

    return res.status(200).json(responseObject);
  } catch (error) {
    return next(error);
  }
};

export const updateCourseOnId: RequestHandler = async (req, res, next) => {
  try {
    // title description level price thumbnail

    // 1 : take necessary things
    const { title, description, level, price, thumbnail } = req.body;

    // 2 : pare it

    const parsed = updateCourseSchema.parse({
      title,
      description,
      level,
      price: Number(price),
      thumbnail,
    });

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      req.params.id,
      parsed,
      {
        new: true,
        runValidators: true,
      }
    );

    // : send response
    const responseObject: IResponseObject = {
      status: "success",
      message: "Course updated successfully",
      data: {
        updatedCourse,
      },
    };

    return res.status(200).json(responseObject);
  } catch (error) {
    return next(error);
  }
};

export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courses = await CourseModel.find().populate(
      "instructorId",
      "name email bio institute specialization experience avatar"
    );

    const responseObject: IResponseObject = {
      status: "success",
      message: "Course fetched successfully",
      data: {
        courses,
      },
    };

    return res.status(200).json(responseObject);
  } catch (error) {
    return next(error);
  }
};
