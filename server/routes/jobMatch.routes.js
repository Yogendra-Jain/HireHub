const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  getJobMatch,
} = require("../controllers/jobMatch.controller");

router.get(
  "/:jobId",
  protect,
  getJobMatch
);

module.exports = router;