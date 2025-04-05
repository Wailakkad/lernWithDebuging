import Groq from 'groq-sdk';
import { DebugRequest } from '../../types/LearningTypes';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function debugWithQwen(request: DebugRequest): Promise<string> {
  const prompt = `
    Fix this ${request.language} code and explain the error:
    Code: ${request.code}
    Error: ${request.error}

    Respond with this format:
    ### Corrected Code:
    \`\`\`${request.language}
    [fixed code here]
    \`\`\`
    
    ### Error Analysis:
    [analysis here]

    ### Fix Explanation:
    [explanation here]
  `;

  const response = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'qwen-2.5-coder-32b',
    temperature: 0.6,
    max_tokens: 2000
  });
  
  return response.choices[0]?.message?.content || '';
}


export async function generateExercice(request: DebugRequest): Promise<string> {
    const { language, generateExercisesCount, generateExercisesLevel, error, code } = request;
    
    const prompt = `
    You are a master software engineer with decades of experience in teaching mentoring junior developers.
    
    I need you to create ${generateExercisesCount} targeted ${generateExercisesLevel} level coding exercises in ${language} that help developers learn to avoid and fix the specific error pattern in this code.
    
    CODE WITH ERROR:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    ERROR MESSAGE:
    ${error || "No explicit error message provided, but the code contains logical or syntax issues."}
    
    EXERCISE REQUIREMENTS:
    - Each exercise must be focused on preventing the same type of error as seen in the code above
    - Exercises should be practical, real-world scenarios a developer would encounter
    - Create progressively challenging exercises that build on the core concept
    - Solutions MUST include detailed comments explaining the concepts and why they work
    
    DEVELOPER LEVEL: ${generateExercisesLevel}
    ${generateExercisesLevel === 'beginner' 
      ? '- Focus on basic syntax and common pitfalls\n- Provide clear, guided exercises\n- Emphasize fundamental concepts with detailed explanations\n- Create simple, focused problems with one main learning objective'
      : generateExercisesLevel === 'intermediate'
      ? '- Include complex logic and edge cases\n- Combine related concepts that work together\n- Emphasize best practices and code efficiency\n- Create realistic scenarios with moderate complexity'
      : '- Cover advanced patterns and optimizations\n- Include complex interactions and debugging\n- Address performance considerations\n- Explore architecture and design decisions'}
    
    YOU MUST FOLLOW THIS EXACT FORMAT FOR EACH EXERCISE:
    
    ### Exercises:
    
    #### Exercise 1:
    Description: [Brief practical problem statement related to the error pattern]
    
    Solution:
    \`\`\`${language}
    [Well-commented, optimal solution code]
    \`\`\`
    
    #### Exercise 2:
    Description: [Brief practical problem statement related to the error pattern]
    
    Solution:
    \`\`\`${language}
    [Well-commented, optimal solution code]
    \`\`\`
    
    [Continue with remaining exercises as requested]
    
    IMPORTANT: Each exercise MUST have both a description AND a solution with detailed comments.
    `;
  
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'qwen-2.5-coder-32b',
      temperature: 0.65, // Slightly higher temperature for creative but practical exercises
      max_tokens: 4000
    });
  
    return response.choices[0]?.message?.content || '';
  }