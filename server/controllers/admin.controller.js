const User        = require("../models/user.model");
const Job         = require("../models/job.model");
const Application = require("../models/application.model");

// ─────────────────────────────────────────────────────────────
// Admin Controller
//
// All routes protected by isAdmin middleware.
// Admin can:
//   1. See platform stats (users, jobs, applications)
//   2. View all users (candidates + recruiters)
//   3. Delete any user
//   4. View all jobs across all recruiters
//   5. Delete any job
//   6. View all applications
// ─────────────────────────────────────────────────────────────

// GET /api/admin/stats
// Returns overall platform numbers
const getStats = async (req, res) => {
  try {
    const totalUsers        = await User.countDocuments();
    const totalCandidates   = await User.countDocuments({ role: "candidate" });
    const totalRecruiters   = await User.countDocuments({ role: "recruiter" });
    const totalJobs         = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    res.status(200).json({
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalJobs,
      totalApplications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
// Returns all users (without passwords)
const getAllUsers = async (req, res) => {
  try {
    // Select all fields except password for security
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/users/:userId
// Admin deletes a user and all their data
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete all applications by this user
    await Application.deleteMany({ candidate: user._id });

    // If recruiter, delete all their jobs too
    if (user.role === "recruiter") {
      await Job.deleteMany({ recruiter: user._id });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/jobs
// Returns all jobs across all recruiters
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("recruiter", "name email") // show recruiter name + email
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/jobs/:jobId
// Admin deletes a job and its applications
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Remove all applications for this job
    await Application.deleteMany({ job: job._id });

    await Job.findByIdAndDelete(req.params.jobId);

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/applications
// Returns all applications with candidate and job info
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("candidate", "name email")
      .populate("job", "title company")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteJob,
  getAllApplications,
};