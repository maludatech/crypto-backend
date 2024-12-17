import express from 'express';
import { signUpController } from '../controllers/authController.js';
import { signInController } from '../controllers/authController.js';
import { forgotPasswordController } from '../controllers/authController.js';
import { restorePasswordController } from '../controllers/authController.js';
import { resetPasswordController } from '../controllers/authController.js';

const router = express.Router();

router.post('/sign-up', signUpController);
router.post('/sign-in', signInController);
router.post('/forgot-password', forgotPasswordController);
router.post('/restore-password', restorePasswordController);
router.post('/reset-password', resetPasswordController);

export default router;
