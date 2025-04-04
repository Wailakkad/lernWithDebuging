export interface DebugRequest {
    code: string;
    error?: string;
    language?: string;
  }
  
  export interface DebugResponse {
    originalCode: string;
    correctedCode: string;
    explanations: {
      errorAnalysis: string;
      fixExplanation: string;
    };
    error?: string;
    details?: string;
  }
  
  export interface DebugError {
    error: string;
    details?: string;
  }