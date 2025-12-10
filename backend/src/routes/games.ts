import { Router } from 'express';
import { startGame, submitScore, getLeaderboard, claimLeaderboardReward, getPendingRewards } from '../controllers/gameController';

const router = Router();
router.post('/start', startGame);
router.post('/submit', submitScore);
router.post('/claim-leaderboard', claimLeaderboardReward);
router.get('/pending-rewards', getPendingRewards);
router.get('/leaderboard/:gameName', getLeaderboard);

export default router;
