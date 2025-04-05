import { Request, Response } from "express";
import SubmissionModel from "../database/models/Submission";
import Exercise from "../database/models/Exercices";

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