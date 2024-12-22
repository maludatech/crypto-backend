import express from 'express';
import {
  signUpController,
  signInController,
  forgotPasswordController,
  restorePasswordController,
  resetPasswordController,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/sign-up', signUpController);
router.post('/sign-in', signInController);
router.post('/forgot-password', forgotPasswordController);
router.post('/restore-password', restorePasswordController);
router.post('/reset-password', resetPasswordController);

export default router;
