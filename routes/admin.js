import express from 'express';
import requireAdminAuth from '../middleware/requireAdminAuth.js';
import {
  changePasswordController,
  userDetailsController,
  getUsersDetailsController,
  sendEmailController,
  deleteUserController,
} from '../controllers/adminController.js';

const router = express.Router();

router.use(requireAdminAuth);

router.get('/users/edit/:id', userDetailsController);
router.get('/:timestamp/get-user-details', getUsersDetailsController);
router.post('/send-email', sendEmailController);
router.post('/change-password', changePasswordController);
router.delete('/users/edit/:id', deleteUserController);

export default router;
