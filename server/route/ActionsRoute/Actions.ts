import exprees from 'express';

const router = exprees.Router();
import {saveSubmission , saveExercices , getSubmissions , getUser} from '../../controllers/Actions';
import { authVerify } from '../../utils/authVerify';


router.post('/saveSubmission', authVerify , saveSubmission);
router.post('/saveExercices', authVerify , saveExercices);
router.get('/getSubmissions', authVerify , getSubmissions);
router.get('/getUser', authVerify , getUser);




export default router;