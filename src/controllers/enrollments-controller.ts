import { NextFunction, Request, Response } from "express";
import { IResponseObject } from "../types/response-object";
import { enrollmentSchema } from "../zod-schemas/enrollment-zod-schemas";
import { EnrollmentModel } from "../models/enrollments-model";
import UserModel from "../models/user-model";
import { RequestWithUser, UserType } from "../types/user-types";
import { CourseModel } from "../models/course-model";

const createEnrollment = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body.courseId);
    console.log(req.user?._id);
    //  Validate request body
    const parsedData = enrollmentSchema.parse({
      courseId: req.body.courseId,
      studentId: req.user?._id?.toString(),
    });
    const { studentId, courseId } = parsedData;

    //  Check if student exists
    const student = await UserModel.findOne({
      _id: studentId,
      userType: UserType.STUDENT,
    });
    if (!student) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    //  Check if course exists
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    //  Prevent duplicate enrollments
    const existingEnrollment = await EnrollmentModel.findOne({
      studentId,
      courseId,
    });
    if (existingEnrollment) {
      return res.status(400).json({
        status: "error",
        message: "Student is already enrolled in this course",
      });
    }

    //  Create new enrollment
    const enrollment = await EnrollmentModel.create({ studentId, courseId });

    const responseObject: IResponseObject = {
      status: "success",
      message: "Enrollment created successfully",
      data: { enrollment },
    };

    return res.status(201).json(responseObject);
  } catch (error: unknown) {
    return next(error); // fallback error handler
  }
};

export { createEnrollment };
