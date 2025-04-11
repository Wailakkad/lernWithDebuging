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
    console.log("exercices : " , response.choices[0]?.message?.content)
    return response.choices[0]?.message?.content || '';
  }



  export async function generateCours(request: DebugRequest): Promise<string> {
    try {
      const { language, code, error } = request;
  
      const prompt = `
      You are an expert software engineering instructor with years of experience in teaching complex programming concepts.
  
      I need you to create a detailed course based on the following code and error. The course should help developers understand the error, why it occurs, and how to fix it. Additionally, the course should include practical examples and explanations to reinforce learning.
  
      CODE WITH ERROR:
      \`\`\`${language}
      ${code}
      \`\`\`
  
      ERROR MESSAGE:
      ${error || "No explicit error message provided, but the code contains logical or syntax issues."}
  
      COURSE REQUIREMENTS:
      - The course must be divided into sections.
      - Each section should have a title and detailed content.
      - Include practical examples and explanations in each section.
      - Provide step-by-step guidance for understanding and fixing the error.
      - Use clear and concise language suitable for developers at various skill levels.
  
      YOU MUST FOLLOW THIS EXACT FORMAT FOR THE COURSE:
  
      ### Course Content:
  
      #### Section 1:
      Title: [Title of the section]
      Content: [Detailed explanation of the section, including examples and practical guidance]
  
      #### Section 2:
      Title: [Title of the section]
      Content: [Detailed explanation of the section, including examples and practical guidance]
  
      [Continue with additional sections as needed]
  
      IMPORTANT: Ensure the course is practical, easy to follow, and provides actionable insights for developers.
      `;
  
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'qwen-2.5-coder-32b',
        temperature: 0.7, // Slightly higher temperature for creative and detailed responses
        max_tokens: 4000,
      });
  
      return response.choices[0]?.message?.content || '';
    } catch (err) {
      console.error('Error generating course:', err);
      throw new Error('Failed to generate course');
    }
  }