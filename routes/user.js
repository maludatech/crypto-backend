import express from "express";
import { profileController } from "../controllers/userController.js";
import { depositController } from "../controllers/userController.js";
import { withdrawalController } from "../controllers/userController.js";
import { supportController } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", profileController);
router.get("/deposit", depositController);
router.get("/withdrawal", withdrawalController);
router.post("/profile", profileController);
router.post("/deposit", depositController);
router.post("/withdrawal", withdrawalController);
router.post("/support", supportController);

export default router;
