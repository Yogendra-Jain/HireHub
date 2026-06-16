const express = require("express");
const router  = express.Router();

const protect = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteJob,
  getAllApplications,
} = require("../controllers/admin.controller");

// All admin routes require:
//   1. protect  → valid JWT token
//   2. isAdmin  → user.role === "admin"

router.get("/stats",              protect, isAdmin, getStats);
router.get("/users",              protect, isAdmin, getAllUsers);
router.delete("/users/:userId",   protect, isAdmin, deleteUser);
router.get("/jobs",               protect, isAdmin, getAllJobs);
router.delete("/jobs/:jobId",     protect, isAdmin, deleteJob);
router.get("/applications",       protect, isAdmin, getAllApplications);

module.exports = router;