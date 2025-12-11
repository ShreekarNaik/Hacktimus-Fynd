import { Router } from 'express';
import { handleCartWebhook, triggerAbandonment, handleAbandonedCart } from '../controllers/webhookController';

const router = Router();

// Fynd webhook endpoints
router.post('/fynd/cart', handleCartWebhook);
router.post('/boltic/trigger-abandonment', triggerAbandonment); // Mock trigger

// Boltic workflow callback endpoint
// Called by "Abandoned Cart Trigger" workflow to get game recovery URL
router.post('/abandoned_cart', handleAbandonedCart);
router.get('/abandoned_cart', handleAbandonedCart); // Also support GET for flexibility

export default router;

