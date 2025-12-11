
import { Router } from 'express';
import { login } from '../controllers/adminController';

const router = Router();

// /api/admin/auth/login
router.post('/auth/login', login);

export default router;
