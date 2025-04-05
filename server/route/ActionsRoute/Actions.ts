import exprees from 'express';

const router = exprees.Router();
import {saveSubmission , saveExercices} from '../../controllers/Actions';
import { authVerify } from '../../utils/authVerify';


router.post('/saveSubmission', authVerify , saveSubmission);
router.post('/saveExercices', authVerify , saveExercices);




export default router;