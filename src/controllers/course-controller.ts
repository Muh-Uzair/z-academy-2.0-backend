import { NextFunction, Request, Response } from "express";
import { IResponseObject } from "../types/response-object";
import { createCourseSchema } from "../zod-schemas/course-zod-schema";
import { RequestWithUser } from "../types/user-types";
import { CourseModel } from "../models/course-model";

export const createCourse = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {

    console.log(req.body)
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
