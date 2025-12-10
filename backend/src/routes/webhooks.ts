import { Router } from 'express';
import { handleCartWebhook, triggerAbandonment } from '../controllers/webhookController';

const router = Router();

router.post('/fynd/cart', handleCartWebhook);
router.post('/boltic/trigger-abandonment', triggerAbandonment); // Mock trigger

export default router;
