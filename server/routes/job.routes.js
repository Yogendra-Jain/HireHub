const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs
} = require("../controllers/job.controller");

router.post("/create", protect, createJob);
router.get("/", getAllJobs);
router.get("/my-jobs", protect, getMyJobs );
router.get("/:id", getJobById);


module.exports = router;