const express = require("express");

const router = express.Router();

const protect =
  require("../middleware/auth.middleware");

const {
  getRecruiterInterviews,
  rescheduleInterview,
  cancelInterview
} = require(
  "../controllers/interviewManagement.controller"
);

router.get(
  "/recruiter",
  protect,
  getRecruiterInterviews
);

router.put(
  "/reschedule/:id",
  protect,
  rescheduleInterview
);

router.put(
  "/cancel/:id",
  protect,
  cancelInterview
);

module.exports = router;