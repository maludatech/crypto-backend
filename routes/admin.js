import express from "express";

const router = express.Router();

router.post("/sign-in", signInController);

module.exports = router;
