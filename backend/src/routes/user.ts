import { Router } from 'express';
import { getProfile, getRewards } from '../controllers/userController';

const router = Router();

router.get('/profile', getProfile);
router.get('/rewards', getRewards);

export default router;
