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
      You are a master software engineer with decades of experience in teaching and mentoring junior developers.
      
      I need you to create ${generateExercisesCount} high-quality ${generateExercisesLevel} level coding exercises in ${language} that will help developers learn to avoid and fix the specific error pattern seen in this code.
      
      CODE WITH ERROR:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      ERROR MESSAGE:
      ${error || "No explicit error message provided, but the code contains logical or syntax issues."}
      
      INSTRUCTIONS:
      1. Carefully analyze the error pattern in the code
      2. Design exercises that target the same concept but in different contexts
      3. Ensure each exercise has clear learning objectives
      4. Make exercises progressively more challenging
      5. Include detailed comments in solutions explaining the key concepts
      6. Focus on real-world practical scenarios that developers encounter
      
      DEVELOPER LEVEL: ${generateExercisesLevel};
      
      For ${generateExercisesLevel} level developers, focus on:
      ${generateExercisesLevel === 'beginner' ? 
        '- Basic syntax and common pitfalls\n- Clear, guided exercises\n- Fundamental concepts with detailed explanations\n- Simple, focused problems with one main learning objective per exercise' : 
        generateExercisesLevel === 'intermediate' ? 
        '- More complex logic and edge cases\n- Combined concepts that work together\n- Best practices and code efficiency\n- Realistic scenarios with moderate complexity' : 
        '- Advanced patterns and optimizations\n- Debugging complex interactions\n- Performance considerations\n- Architecture and design decisions'}
      
      RESPOND USING EXACTLY THIS FORMAT:
      
      ### Exercises:
      
      #### Exercise 1:
      Description: [Concise problem statement with clear objectives]
      
      Solution:
      \`\`\`${language}
      [Well-commented, optimal solution code]
      \`\`\`
      
      #### Exercise 2:
      Description: [Concise problem statement with clear objectives]
      
      Solution:
      \`\`\`${language}
      [Well-commented, optimal solution code]
      \`\`\`
      
      [Continue with remaining exercises as requested]
    `;
  
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'qwen-2.5-coder-32b',
      temperature: 0.65, // Slightly higher temperature for creative but practical exercises
      max_tokens: 4000
    });
  
    return response.choices[0]?.message?.content || '';
  }