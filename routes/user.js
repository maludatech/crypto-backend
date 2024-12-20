import express from 'express';
import requireUserAuth from '../middleware/requireUserAuth.js';
import { profileController } from '../controllers/userController.js';
import { depositController } from '../controllers/userController.js';
import { withdrawalController } from '../controllers/userController.js';
import { supportController } from '../controllers/userController.js';
import { referralController } from '../controllers/userController.js';

const router = express.Router();

router.use(requireUserAuth); //we use it at the beginning because we want to protect our other CRUD methods, the next function in the requireAuth will fire the next method after token verification is completed

router.get('/referral/:id', referralController);
router.get('/deposit/:id', depositController);
router.get('/withdrawal/:id', withdrawalController);
router.post('/profile-update', profileController);
router.post('/deposit/:id', depositController);
router.post('/withdrawal/:id', withdrawalController);
router.post('/support/:id', supportController);

export default router;
