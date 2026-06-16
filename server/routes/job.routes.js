const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * Job Routes
 *
 * ⚠️ IMPORTANT: Route order matters in Express.
 * Specific routes like "/my-jobs" MUST come BEFORE dynamic routes like "/:id"
 * Otherwise Express treats "my-jobs" as an ID value → wrong handler is called.
 *
 * Bug example if order is wrong:
 *   GET /my-jobs → Express matches /:id with id = "my-jobs" → getJobById runs instead of getMyJobs!
 */

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get("/", jobController.getAllJobs);               // GET /api/jobs — all jobs (with search/filters)

// ─── Recruiter Protected Routes (MUST be before /:id) ─────────────────────────
router.post("/create", authMiddleware, jobController.createJob);     // POST   /api/jobs/create
router.get("/my-jobs", authMiddleware, jobController.getMyJobs);     // GET    /api/jobs/my-jobs ← BEFORE /:id

// ─── Dynamic :id Routes (must come LAST) ──────────────────────────────────────
router.get("/:id",    jobController.getJobById);                     // GET    /api/jobs/:id
router.put("/:id",    authMiddleware, jobController.updateJob);      // PUT    /api/jobs/:id
router.delete("/:id", authMiddleware, jobController.deleteJob);      // DELETE /api/jobs/:id

module.exports = router;