import { Request, Response } from "express";
import SubmissionModel from "../database/models/Submission";
import Exercise from "../database/models/Exercices";
import UserModel from "../database/models/User";
import Course from "../database/models/Course";
import mongoose from 'mongoose';
interface AuthRequest extends Request {
  user?: {
    id: string; // This will hold the userId from the middleware
  };
}

export const saveSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      originalCode,
      correctedCode,
      errorType,
      language,
      errorAnalysis,
      exerciseRequest,
    } = req.body;

    // Get userId from req.user (populated by authVerify middleware)
    const userId = req.user?.id;

    // Validate required fields
    if (!userId || !originalCode || !errorType || !language || !exerciseRequest) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    // Create a new submission object
    const newSubmission = new SubmissionModel({
      userId, // Set userId from the middleware
      originalCode,
      correctedCode,
      errorType,
      language,
      errorAnalysis,
      exerciseRequest,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save the submission to the database
    const savedSubmission = await newSubmission.save();

    // Respond with the saved submission
    res.status(201).json({
      message: "Submission saved successfully.",
      submission: savedSubmission,
    });
    console.log("Submission saved successfully:", savedSubmission);
  } catch (error) {
    console.error("Error saving submission:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const saveExercices = async (req : AuthRequest, res: Response): Promise<void> => {
  try{
    const {exercises} = req.body;

    const userId = req.user?.id; // Get userId from the middleware

    if(!userId || !exercises) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    // Create a new exercise object
    const newExercise = new Exercise({
      userId, // Set userId from the middleware
      exercises,
      createdAt: new Date(),
    })
    const savedExercise = await newExercise.save();
    res.status(201).json({
      message: "Exercices saved successfully.",
      exercices: savedExercise,
    })


  }catch(err){
    console.error("Error saving exercices:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const saveCourses = async (req : AuthRequest, res: Response): Promise<void> => {
  try{
    const {courses , language} = req.body;

    const userId = req.user?.id; // Get userId from the middleware

    if(!userId || !courses || !language) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    // Create a new exercise object
    const newCourse = new Course({
      userId, // Set userId from the middleware
      language,
      courses,
      createdAt: new Date(),
    })
    const savedCoursees = await newCourse.save();
    res.status(201).json({
      message: "Courses saved successfully.",
      courses: savedCoursees,
    })


  }catch(err){
    console.error("Error saving exercices:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const getSubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from the middleware

    if (!userId) {
      res.status(400).json({ message: "Missing user ID." });
      return;
    }

    // Fetch submissions for the user
    const submissions = await SubmissionModel.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Submissions fetched successfully.",
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const getExercises = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from the middleware

    if (!userId) {
      res.status(400).json({ message: "Missing user ID." });
      return;
    }

    // Fetch exercises for the user
    const exercises = await Exercise.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Exercises fetched successfully.",
      exercises,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // Get userId from the middleware

    if (!userId) {
      res.status(400).json({ message: "Missing user ID." });
      return;
    }

    // Fetch exercises for the user
    const courses = await   Course.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Courses fetched successfully.",
      courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const getUser = async (req : AuthRequest , res : Response)  : Promise<void> =>{
  try{
    const userId = req.user?.id; // Get userId from the middleware
      
      if (!userId) {
        res.status(400).json({ message: "Missing user ID." });
        return;
      }
  
      // Fetch user details for the user
      const user = await UserModel.findById(userId).sort({ createdAt: -1 });
  
      res.status(200).json({
        message: "User fetched successfully.",
        user,
      });

  }catch(err){
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error." });
  }

}




export const MarkStatusExercice = async (req : AuthRequest , res : Response) : Promise<void> =>{
  const {Newstatus} = req.body;
  const {exerciseId} = req.params;
  const userId = req.user?.id;
  if(!userId){
    res.status(400).json({message : "user Id not found"})
    return;
  }
  if(!exerciseId){
    res.status(400).json({message : "exercise Id not found"})
    return;
  }
  if(!Newstatus){
    res.status(400).json({message : "New Status from body is required"})
    return;
  }
  try{
    const objectIdExerciseId = new mongoose.Types.ObjectId(exerciseId);

    const response = await Exercise.updateOne({userId : userId , "exercises._id" : objectIdExerciseId} , {$set : {"exercises.$.status" : Newstatus}});
   
    if (response.matchedCount === 0) {
      res.status(404).json({ message: "Exercise not found" });
      return;
    }

    if (response.modifiedCount === 0) {
      res.status(400).json({ message: "Failed to update exercise status" });
      return;
    }

    res.status(200).json({message : "status marked successfuly"})
  }catch(err){
    console.log("server error : " , err);
    res.status(500).json({message : err})
  }


}

export const deleteSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params; // Corrected parameter name
    const userId = req.user?.id; // Get userId from the middleware

    if (!userId) {
      res.status(400).json({ message: "Missing user ID." });
      return;
    }

    if (!submissionId) {
      res.status(400).json({ message: "Missing submission ID." });
      return;
    }

    // Convert submissionId to ObjectId if necessary
    const objectIdSubmissionId = new mongoose.Types.ObjectId(submissionId);

    // Delete the submission document
    const response = await SubmissionModel.deleteOne({ userId: userId, _id: objectIdSubmissionId });

    if (response.deletedCount === 0) {
      res.status(404).json({ message: "Submission not found." });
      return;
    }

    res.status(200).json({ message: "Submission deleted successfully." });
  } catch (err) {
    console.error("Error deleting submission:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params; // Corrected parameter name
    const userId = req.user?.id; // Get userId from the middleware

    if (!userId) {
      res.status(400).json({ message: "Missing user ID." });
      return;
    }

    if (!courseId) {
      res.status(400).json({ message: "Missing submission ID." });
      return;
    }

    // Convert submissionId to ObjectId if necessary
    const objectIdCourseId = new mongoose.Types.ObjectId(courseId);

    // Delete the submission document
    const response = await Course.updateOne(
      { userId, "courses._id":objectIdCourseId}, // Match the document by userId and exerciseId
      { $pull: { exercises: { _id: objectIdCourseId } } } // Remove the exercise with the specified _id
    );
    if (response.modifiedCount === 0) {
      res.status(404).json({ message: "Course not found." });
      return;
    }

    res.status(200).json({ message: "Course deleted successfully." });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const deleteExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { exerciseId } = req.params;
    const userId = req.user?.id; // Get userId from the middleware

    if (!userId) {
      res.status(400).json({ message: "Missing user ID." });
      return;
    }

    if (!exerciseId) {
      res.status(400).json({ message: "Missing exercise ID." });
      return;
    }

    // Convert exerciseId to ObjectId if necessary
    const objectIdExerciseId = new mongoose.Types.ObjectId(exerciseId);

    // Use $pull to remove the exercise from the exercises array
    const response = await Exercise.updateOne(
      { userId, "exercises._id": objectIdExerciseId }, // Match the document by userId and exerciseId
      { $pull: { exercises: { _id: objectIdExerciseId } } } // Remove the exercise with the specified _id
    );

    console.log("Update response:", response);

    if (response.matchedCount === 0) {
      res.status(404).json({ message: "Exercise not found." });
      return;
    }

    if (response.modifiedCount === 0) {
      res.status(404).json({ message: "Exercise not found or already deleted." });
      return;
    }

    res.status(200).json({ message: "Exercise deleted successfully." });
  } catch (err) {
    console.error("Error deleting exercise:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const editProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { formData } = req.body;

  if (!userId || !formData) {
    res.status(400).json({ message: "Missing user ID or form data." });
    return;
  }

  try {
    // Update only the fields provided in formData
    const response = await UserModel.findByIdAndUpdate(
      userId, // Find the user by ID
      { $set: formData }, // Update only the fields provided in formData
      { new: true, runValidators: true } // Return the updated document and validate the changes
    );

    if (!response) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: response, // Return the updated user profile
    });
  } catch (err: any) {
    console.error("Error editing profile:", err);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};




