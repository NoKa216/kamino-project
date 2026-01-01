import { Router } from 'express';
import { signup, socialAuth, login, anonymousAuth } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/social', socialAuth);
router.post('/login', login);
router.post('/anonymous', anonymousAuth);

export default router;