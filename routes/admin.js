import express from "express";
import { signInController } from "../controllers/adminController.js";

const router = express.Router();

router.post("/sign-in", signInController);

export default router;
