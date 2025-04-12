import exprees from 'express';

const router = exprees.Router();
import {saveSubmission , saveExercices , getSubmissions , getUser , getExercises , getCourses , deleteExercise , MarkStatusExercice , deleteSubmission , saveCourses} from '../../controllers/Actions';
import { authVerify } from '../../utils/authVerify';


router.post('/saveSubmission', authVerify , saveSubmission);
router.post('/saveExercices', authVerify , saveExercices);
router.get('/getSubmissions', authVerify , getSubmissions);
router.get('/getUser', authVerify , getUser);
router.get('/getExercises', authVerify , getExercises);
router.delete('/deleteExercise/:exerciseId', authVerify , deleteExercise);
router.post('/MarkStatusExercice/:exerciseId', authVerify , MarkStatusExercice);
router.delete('/deleteSubmission/:submissionId', authVerify , deleteSubmission);
router.post('/saveCourses' , authVerify , saveCourses);
router.get('/getCourses', authVerify , getCourses);


export default router;