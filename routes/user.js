import express from "express";

const router = express.Router();

router.get("/profile", profileController);
router.get("/deposit", depositController);
router.get("/withdrawal", withdrawalController);
router.post("/profile", profileController);
router.post("/deposit", depositController);
router.post("/withdrawal", withdrawalController);
router.post("/support", Controller);

modules.export = router;
