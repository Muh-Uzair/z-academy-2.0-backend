import UserModel from "../models/user-model";
import { NextFunction, Response } from "express";
import { RequestWithUser } from "../types/user-types";
import { CourseModel } from "../models/course-model";
import { EnrollmentModel } from "../models/enrollments-model";
import { updateInstructorProfileSchema } from "../zod-schemas/users-zod-schema";
import { AppError } from "../utils/AppError";

const getStudentsOnInstructorId = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : validate user/instructor id
    const instructorId = req.user?._id?.toString();
    if (!instructorId) {
      return res.status(400).json({
        status: "fail",
        message: "Instructor ID missing from request",
      });
    }

    // 2 : fetch courses of that instructor
    const allCourses = await CourseModel.find({ instructorId }).select("_id");

    if (!allCourses || allCourses.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No courses found for this instructor",
        data: { allStudentForInstructor: [] },
      });
    }

    // 3 : extract course ids
    const courseIds = allCourses.map((c) => c._id);

    // 4 : find enrollments for those courses
    const allEnrollments = await EnrollmentModel.find({
      courseId: { $in: courseIds },
    }).select("studentId");

    if (!allEnrollments || allEnrollments.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No students enrolled in instructor's courses",
        data: { allStudentForInstructor: [] },
      });
    }

    // 5 : extract unique student ids
    const studentIds = [
      ...new Set(allEnrollments.map((e) => e.studentId?.toString())),
    ].filter(Boolean);

    if (studentIds.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No valid student IDs found",
        data: { allStudentForInstructor: [] },
      });
    }

    // 6 : fetch all students
    const allStudentForInstructor = await UserModel.find({
      _id: { $in: studentIds },
    });

    return res.status(200).json({
      status: "success",
      message: "Students on instructor id success",
      data: {
        allStudentForInstructor,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

const getInstructorProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1: Check if user id exists
    const instructorId = req.user?._id;
    if (!instructorId) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized: No user id found in request",
      });
    }

    // 2: Fetch instructor
    const instructorProfile = await UserModel.findById(instructorId);

    // 3: Handle not found
    if (!instructorProfile) {
      return res.status(404).json({
        status: "fail",
        message: "Instructor not found",
      });
    }

    // 4: Ensure correct userType
    if (instructorProfile.userType !== "instructor") {
      return res.status(403).json({
        status: "fail",
        message: "Access denied: User is not an instructor",
      });
    }

    //  5: Success response
    return res.status(200).json({
      status: "success",
      message: "Instructor profile fetched successfully",
      data: {
        instructorProfile,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

const updateInstructorProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : get instructor id
    const instructorId = req.user?._id;
    if (!instructorId) {
      throw new AppError("Unauthorized: Instructor ID not found in token", 401);
    }

    // 2 : take necessary items out
    const { name, bio, institute, specialization, experience } = req.body;

    // 3 : parse the data on zod
    let parsedData;
    try {
      parsedData = updateInstructorProfileSchema.parse({
        name,
        bio,
        institute,
        specialization,
        experience: Number(experience),
      });
    } catch (err: any) {
      return next(err);
    }

    // 4 : update the profile
    const updatedProfile = await UserModel.findByIdAndUpdate(
      instructorId,
      parsedData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      throw new AppError("Instructor not found", 404);
    }

    return res.status(200).json({
      status: "success",
      message: "Instructor profile updated successfully",
      data: { updatedProfile },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

export {
  getStudentsOnInstructorId,
  getInstructorProfile,
  updateInstructorProfile,
};
