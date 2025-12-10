import { Router } from 'express';
import { startGame, submitScore, getLeaderboard } from '../controllers/gameController';

const router = Router();

router.post('/start', startGame);
router.post('/submit', submitScore);
router.get('/leaderboard/:gameName', getLeaderboard);

export default router;
