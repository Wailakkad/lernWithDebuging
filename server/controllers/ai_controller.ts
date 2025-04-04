import { Request, Response } from 'express'; 
import { handleDebugRequest } from '../ai_services/manger_ai'; 
import { DebugRequest } from '../types/LearningTypes';  

export async function debugCode(req: Request, res: Response) {   
  try {    
    console.log("Debugging request received:", req.body); // Log the incoming request for debugging 
    const request: DebugRequest = {       
      code: req.body.code,       
      error: req.body.error,       
      language: req.body.language || 'javascript',
      // Add these new fields from the frontend request
      generateExercises: req.body.generateExercises || false,
      generateExercisesCount: req.body.generateExercisesCount || 0,
      generateExercisesLevel: req.body.generateExercisesLevel || 'beginner'
    };      
    
    const result = await handleDebugRequest(request);     
    res.json(result);   
  } catch (error : any) {     
    res.status(500).json({       
      error: 'Debugging failed',       
      details: error.message     
    });   
  } 
}