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
  deleteCourse
} from '../../controllers/Actions';
import { authVerify } from '../../utils/authVerify';
import Course from '../../database/models/Course';

// Define routes
router.post('/saveSubmission', authVerify, saveSubmission);
router.post('/saveExercices', authVerify, saveExercices);
router.post('/MarkStatusExercice/:exerciseId', authVerify, MarkStatusExercice);
router.post('/editProfile', authVerify, editProfile);
router.post('/saveCourses', authVerify, saveCourses);
router.get('/getSubmissions', authVerify, getSubmissions);
router.get('/getUser', authVerify, getUser);
router.get('/getCourses', authVerify, getCourses);
router.get('/getCourses', authVerify, getCourses);
router.get('/getExercises', authVerify, getExercises);
router.delete('/deleteExercise/:exerciseId', authVerify, deleteExercise);
router.delete('/deleteSubmission/:submissionId', authVerify, deleteSubmission);
router.delete('/deleteCourse/:courseId', authVerify, deleteCourse);

// Fetch all users
router.get('/course', async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await Course.find(); // Fetch all users
    res.json(response); // Send the response
  } catch (err) {
    console.error("Error fetching users:", err); // Log the error
    res.status(500).json({ message: "Internal server error" }); // Send error response
  }
});

export default router;