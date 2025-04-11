export interface DebugRequest {
    code: string;
    error: string;
    language: string;
    generateExercises?: boolean;
    generateExercisesCount?: number;
    generateExercisesLevel?: 'beginner' | 'intermediate' | 'advanced';
    generateCourse?: boolean;
  }
  
  export interface DebugResponse {
    originalCode: string;
    correctedCode: string;
    explanations: {
      errorAnalysis: string;
      fixExplanation: string;
    };
    exercises?: Exercise[];
    course?: Array<{
      id: number;
      title: string;
      content: string;
    }>; 
  }

  export interface Exercise {
    id: number;
    description: string;
    solution: string;
  }