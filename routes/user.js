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
} from '../controllers/userController.js';

const router = express.Router();

router.use(requireUserAuth); //we use it at the beginning because we want to protect our other CRUD methods, the next function in the requireAuth will fire the next method after token verification is completed

router.get('/referral/:id', referralController);
router.get('/deposit/:id', getDepositController);
router.get('/withdrawal/:id', getWithdrawalController);
router.post('/profile-update', profileController);
router.post('/deposit/:id', depositController);
router.post('/withdrawal/:id', withdrawalController);
router.post('/support/:id', supportController);

export default router;
