import { DebugRequest, DebugResponse } from '../types/LearningTypes';
import { debugWithQwen, generateExercice, generateCours } from './GROQ/groq.service';

export async function handleDebugRequest(request: DebugRequest): Promise<DebugResponse> {
  const aiResponse = await debugWithQwen(request);
  const debugResult = parseQwenResponse(aiResponse, request);

  console.log("cours : ", request.generateCourse);
  // If exercises are requested, generate them
  let exercises: Array<{ id: number; description: string; solution: string }> = [];
  if (request.generateExercises && request.generateExercisesCount) {
    const exercisesResponse = await generateExercice(request);
    exercises = parseExercisesResponse(exercisesResponse);
  }

  // If course generation is requested, generate the course
  let course: Array<{ id: number; title: string; content: string }> | undefined = undefined; // Use undefined instead of null
  if (request.generateCourse) {
    const courseResponse = await generateCours(request);
    course = parseCourseResponse(courseResponse);
  }
  console.log("the cours is : " , course)

  return {
    ...debugResult,
    exercises,
    course, // Include the generated course
  };
}


// Organize the response from Qwen into a structured format
function parseQwenResponse(response: string, request: DebugRequest): DebugResponse {
  const codeMatch = response.match(/```[\s\S]*?\n([\s\S]*?)```/);
  const analysisMatch = response.match(/### Error Analysis:\n([\s\S]*?)\n###/);
  const fixMatch = response.match(/### Fix Explanation:\n([\s\S]*)/);

  return {
    originalCode: request.code,
    correctedCode: codeMatch ? codeMatch[1].trim() : 'Failed to parse code',
    explanations: {
      errorAnalysis: analysisMatch ? analysisMatch[1].trim() : '',
      fixExplanation: fixMatch ? fixMatch[1].trim() : '',
    },
  };
}

function parseExercisesResponse(response: string) {
  const exercisesMatch = response.match(/### Exercises:([\s\S]*)/);

  if (!exercisesMatch) {
    return [];
  }

  const exercisesText = exercisesMatch[1];
  const exerciseBlocks = exercisesText.split(/#### Exercise \d+:/g).filter(block => block.trim().length > 0);

  return exerciseBlocks.map((block, index) => {
    const descriptionMatch = block.match(/Description:([\s\S]*?)Solution:/);
    const solutionMatch = block.match(/Solution:\s*```([\s\S]*?)```/) || block.match(/Solution:\s*([\s\S]*)/);

    return {
      id: index + 1,
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      solution: solutionMatch ? solutionMatch[1].trim() : '',
    };
  });
}

// Parse the AI response to extract course content
function parseCourseResponse(response: string): Array<{ id: number; title: string; content: string }> | undefined {
  const courseMatch = response.match(/### Course Content:([\s\S]*)/);

  if (!courseMatch) {
    return undefined; // Return undefined instead of null
  }

  const courseText = courseMatch[1];
  const sections = courseText.split(/#### Section \d+:/g).filter(section => section.trim().length > 0);

  return sections.map((section, index) => {
    const titleMatch = section.match(/Title:([\s\S]*?)Content:/);
    const contentMatch = section.match(/Content:([\s\S]*)/);

    return {
      id: index + 1,
      title: titleMatch ? titleMatch[1].trim() : `Section ${index + 1}`,
      content: contentMatch ? contentMatch[1].trim() : '',
    };
  });
}