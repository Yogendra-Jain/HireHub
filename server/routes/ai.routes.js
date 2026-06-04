const express = require("express");

const router = express.Router();

const {
  analyzeResume,
} = require("../controllers/ai.controller");

const protect = require("../middleware/auth.middleware");

router.get(
  "/analyze-resume",
  protect,
  analyzeResume
);

module.exports = router;