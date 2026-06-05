const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  generateInterviewQuestions,
} = require("../controllers/interview.controller");

router.get(
  "/:jobId",
  protect,
  generateInterviewQuestions
);

module.exports = router;