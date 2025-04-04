export interface DebugRequest {
    code: string;
    error: string;
    language: string;
    generateExercises?: boolean;
    generateExercisesCount?: number;
    generateExercisesLevel?: 'beginner' | 'intermediate' | 'advanced';
  }
  
  export interface DebugResponse {
    originalCode: string;
    correctedCode: string;
    explanations: {
      errorAnalysis: string;
      fixExplanation: string;
    };
    exercises?: Exercise[]; // Optional field for exercises
  }

  export interface Exercise {
    id: number;
    description: string;
    solution: string;
  }