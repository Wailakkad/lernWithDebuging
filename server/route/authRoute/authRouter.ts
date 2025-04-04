import express from 'express';
import { Login , Register } from '../../controllers/auth_controller';// Named import
const router = express.Router();

// POST /api/auth/testuser
router.post('/login', Login); // Directly use the controller
router.post('/register', Register); // Directly use the controller
export default router;