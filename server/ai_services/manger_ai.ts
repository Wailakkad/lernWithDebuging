import { DebugRequest, DebugResponse } from '../types/LearningTypes';
import { debugWithQwen , generateExercice } from './GROQ/groq.service';

export async function handleDebugRequest(request: DebugRequest): Promise<DebugResponse> {
  
  const aiResponse = await debugWithQwen(request);
  const debugResult =  parseQwenResponse(aiResponse, request);


    // If exercises are requested, generate them
    if (request.generateExercises && request.generateExercisesCount) {
       
      const exercisesResponse = await generateExercice(request);
      const exercises = parseExercisesResponse(exercisesResponse);
      
      return {
        ...debugResult,
       exercises: exercises
      };
    }

    return {
        ...debugResult,
        exercises: [] // No exercises generated
    }; 
}


// organize the response from Qwen into a structured format
// This is a simple parser and may need to be adjusted based on the actual response format
function parseQwenResponse(response: string, request: DebugRequest): DebugResponse {
  // Simple parser - improve based on your actual response format
  console.log(response)
  const codeMatch = response.match(/```[\s\S]*?\n([\s\S]*?)```/);
  const analysisMatch = response.match(/### Error Analysis:\n([\s\S]*?)\n###/);
  const fixMatch = response.match(/### Fix Explanation:\n([\s\S]*)/);

  return {
    originalCode: request.code,
    correctedCode: codeMatch ? codeMatch[1].trim() : 'Failed to parse code',
    explanations: {
      errorAnalysis: analysisMatch ? analysisMatch[1].trim() : '',
      fixExplanation: fixMatch ? fixMatch[1].trim() : ''
    }
  };
}
function parseExercisesResponse(response: string) {
    const exercisesMatch = response.match(/### Exercises:([\s\S]*)/);
    
    if (!exercisesMatch) {
      return [];
    }
    
    // Split the exercises by exercise header
    const exercisesText = exercisesMatch[1];
    const exerciseBlocks = exercisesText.split(/#### Exercise \d+:/g).filter(block => block.trim().length > 0);
    
    return exerciseBlocks.map((block, index) => {
      // Parse individual exercise
      const descriptionMatch = block.match(/Description:([\s\S]*?)Solution:/);
      const solutionMatch = block.match(/Solution:\s*```[\s\S]*?\n([\s\S]*?)```/);
      
      return {
        id: index + 1,
        description: descriptionMatch ? descriptionMatch[1].trim() : '',
        solution: solutionMatch ? solutionMatch[1].trim() : ''
      };
    });
}