const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  scheduleInterview,
  getMyInterviews
} = require(
  "../controllers/interviewSchedule.controller"
);

router.post(
  "/schedule/:applicationId",
  protect,
  scheduleInterview
);

router.get(
  "/my-interviews",
  protect,
  getMyInterviews
);
module.exports = router;