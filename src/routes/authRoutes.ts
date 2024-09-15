import { Router } from 'express';
import { signup, verifyOTP, login } from '../controllers/authController';

const router = Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

export default router;
