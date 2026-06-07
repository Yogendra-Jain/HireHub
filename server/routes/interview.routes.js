const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  generateInterviewQuestions,
  evaluateAnswer,
} = require(
  "../controllers/interview.controller"
);

router.get(
  "/:jobId",
  protect,
  generateInterviewQuestions
);
router.post(
  "/evaluate",
  protect,
  evaluateAnswer
);
module.exports = router;