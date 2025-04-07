import exprees from 'express';

const router = exprees.Router();
import {saveSubmission , saveExercices , getSubmissions , getUser , getExercises} from '../../controllers/Actions';
import { authVerify } from '../../utils/authVerify';


router.post('/saveSubmission', authVerify , saveSubmission);
router.post('/saveExercices', authVerify , saveExercices);
router.get('/getSubmissions', authVerify , getSubmissions);
router.get('/getUser', authVerify , getUser);
router.get('/getExercises', authVerify , getExercises);




export default router;