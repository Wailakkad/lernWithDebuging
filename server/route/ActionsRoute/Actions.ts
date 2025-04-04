import exprees from 'express';

const router = exprees.Router();
import {saveSubmission} from '../../controllers/Actions';


router.post('/saveSubmission', saveSubmission);


export default router;