const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  getJobMatch,
  getApplicantsMatch,
} = require("../controllers/jobMatch.controller");

router.get(
  "/:jobId",
  protect,
  getJobMatch
);

router.get(
  "/applicants-match/:jobId",
  protect,
  getApplicantsMatch
);

module.exports = router;