"use client";

import axios from "axios";
import { toast } from "sonner";

export interface SaveExerciseParams {
  exercises: {
    description: string;
    solution: {
      code: string;
    };
    difficulty: "easy" | "medium" | "hard";
    language: string;
  }[];
}

export const SaveExercises = async (data: SaveExerciseParams): Promise<void> => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/actions/saveExercices", // Update endpoint as needed
      data,
      {
        withCredentials: true, // Include credentials if required
      }
    );

    if (response.status === 201) {
      toast.success("Exercises saved successfully!");
      console.log("Exercises saved successfully:", response.data);
    } else {
      toast.error("Failed to save exercises.");
      console.error("Failed to save exercises:", response.statusText);
    }
  } catch (error: any) {
    console.error("Error saving exercises:", error);
    toast.error(error.response?.data?.message || "Error saving exercises");
    throw error;
  }
};