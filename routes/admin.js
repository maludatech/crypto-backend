import express from 'express';
import requireAdminAuth from '../middleware/requireAdminAuth.js';
import { sendEmailController } from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAdminAuth);

router.post('/send-email', sendEmailController);

export default router;
