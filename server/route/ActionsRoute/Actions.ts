import express, { Request, Response } from 'express';

const router = express.Router();
import {
  saveSubmission,
  saveExercices,
  getSubmissions,
  getUser,
  getExercises,
  getCourses,
  deleteExercise,
  MarkStatusExercice,
  deleteSubmission,
  saveCourses,
  editProfile,
} from '../../controllers/Actions';
import { authVerify } from '../../utils/authVerify';
import UserModel from '../../database/models/User';

// Define routes
router.post('/saveSubmission', authVerify, saveSubmission);
router.post('/saveExercices', authVerify, saveExercices);
router.get('/getSubmissions', authVerify, getSubmissions);
router.get('/getUser', authVerify, getUser);
router.get('/getExercises', authVerify, getExercises);
router.delete('/deleteExercise/:exerciseId', authVerify, deleteExercise);
router.post('/MarkStatusExercice/:exerciseId', authVerify, MarkStatusExercice);
router.delete('/deleteSubmission/:submissionId', authVerify, deleteSubmission);
router.post('/saveCourses', authVerify, saveCourses);
router.get('/getCourses', authVerify, getCourses);
router.post('/editProfile', authVerify, editProfile);

// Fetch all users
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await UserModel.find(); // Fetch all users
    res.json(response); // Send the response
  } catch (err) {
    console.error("Error fetching users:", err); // Log the error
    res.status(500).json({ message: "Internal server error" }); // Send error response
  }
});

export default router;