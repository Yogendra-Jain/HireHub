const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createJob,
  getAllJobs,
} = require("../controllers/job.controller");

router.post("/create", protect, createJob);
router.get("/", getAllJobs);
module.exports = router;