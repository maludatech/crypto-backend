import express from 'express';
import requireAdminAuth from '../middleware/requireAdminAuth.js';
import {
  changePasswordController,
  getUserDetailsController,
  getUsersDetailsController,
  sendEmailController,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAdminAuth);

router.get('/:timestamp/get-user-details', getUserDetailsController);
router.get('/:timestamp/get-user-details', getUsersDetailsController);
router.post('/send-email', sendEmailController);
router.post('/change-password', changePasswordController);

export default router;
