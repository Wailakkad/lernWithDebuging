import { Request, Response } from "express";
import SubmissionModel from "../database/models/Submission";
import Exercise from "../database/models/Exercices";



export const saveSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        userId,
        originalCode,
        correctedCode,
        errorType,
        language,
        errorAnalysis,
        exerciseRequest,
      } = req.body;
  
      // Validate required fields
      if (!userId || !originalCode || !errorType || !language || !exerciseRequest) {
        res.status(400).json({ message: "Missing required fields." });
        return;
      }
  
      // Create a new submission object
      const newSubmission = new SubmissionModel({
        userId,
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