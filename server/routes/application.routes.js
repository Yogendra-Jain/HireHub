const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  applyJob,
  getApplicants,
  updateStatus,
} = require("../controllers/application.controller");

router.post("/apply/:jobId",protect, applyJob );
router.get(
  "/job/:jobId",
  protect,
  getApplicants
);

router.put(
  "/status/:applicationId",
  protect,
  updateStatus
);

module.exports = router;