import express from 'express';
import requireUserAuth from '../middleware/requireUserAuth.js';
import {
  getDepositController,
  getWithdrawalController,
  profileController,
  depositController,
  withdrawalController,
  supportController,
  referralController,
  patchDepositController,
  patchWithdrawalController,
} from '../controllers/userController.js';

const router = express.Router();

router.use(requireUserAuth); //Middleware for protection of authentication-required routes

router.get('/referral/:id', referralController);
router.get('/deposit/:id', getDepositController);
router.get('/withdrawal/:id', getWithdrawalController);
router.post('/profile-update', profileController);
router.post('/deposit/:id', depositController);
router.post('/withdrawal/:id', withdrawalController);
router.post('/support/:id', supportController);
router.patch('/deposit/:id', patchDepositController);
router.patch('/withdrawal/:id', patchWithdrawalController);

export default router;
