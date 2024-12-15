import express from "express";

const router = express.Router();

router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
router.post("/forgot-password", forgotPasswordController);
router.post("/restore-password", restorePasswordController);
router.post("/reset-password", resetPasswordController);

module.exports = router;
