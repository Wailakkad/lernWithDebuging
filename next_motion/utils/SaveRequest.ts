"use client";

import axios from "axios";
import { toast } from "sonner"; // Optional: For user notifications

interface SaveRequestParams {
  originalCode: string;
  correctedCode: string;
  errorType: string;
  language: string;
  errorAnalysis?: {
    description?: string;
    solutionSteps?: string[]; // Updated to match the backend format
  };
  exerciseRequest: {
    count: number; // Updated to match the backend format
    difficulty: "easy" | "medium" | "hard"; // Updated to match the backend format
  };
}

export const SaveSubmissions = async (data: SaveRequestParams): Promise<void> => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/actions/saveSubmission", 
      data,
      {
        withCredentials: true // THIS IS CRUCIAL
      }
    );

    if (response.status === 201) {
      toast.success("Submission saved successfully!");
    } else {
      toast.error("Failed to save submission.");
    }
  } catch (error : any) {
    console.error("Error:", error);
    toast.error(error.response?.data?.message || "Error saving submission");
  }
};