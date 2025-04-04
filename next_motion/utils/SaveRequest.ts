"use client";

import axios from "axios";
import { toast } from "sonner"; // Optional: For user notifications

interface SaveRequestParams {
  userId: string; // Added userId to match the backend format
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
    const response = await axios.post("http://localhost:3001/api/actions/saveSubmission", data); // Updated endpoint to match the backend route

    if (response.status === 201) { // 201 indicates resource creation
      toast.success("Submission saved successfully!");
      console.log("Submission saved successfully:", response.data);
    } else {
      toast.error("Failed to save submission.");
      console.error("Failed to save submission:", response.statusText);
    }
  } catch (error) {
    console.error("Error saving submission:", error);
    toast.error("Error saving submission. Please try again.");
    throw error;
  }
};