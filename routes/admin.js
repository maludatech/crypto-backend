import express from 'express';
import requireAdminAuth from '../middleware/requireAdminAuth.js';
import {
  changePasswordController,
  sendEmailController,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAdminAuth);

router.post('/send-email', sendEmailController);
router.post('/change-password', changePasswordController);

export default router;
