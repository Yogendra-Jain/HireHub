const Application = require("../models/application.model");
const Job         = require("../models/job.model");
const sendEmail = require("../utils/sendEmail");

const applyJob = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ message: "Candidate only" });
    }

    const existing = await Application.findOne({
      candidate: req.user.id,
      job:       req.params.jobId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      candidate: req.user.id,
      job:       req.params.jobId,
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// BUG FIX #4 — Recruiter can't see applicant resume
//
// Old: .populate("candidate", "name email")
//   → only returned name and email
//
// Fix: .populate("candidate", "name email resume resumeAnalysis")
//   → now includes resume URL and analysis data
//   → Recruiter can click "View Resume" for each applicant
// ─────────────────────────────────────────────────────────────
const getApplicants = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Recruiter only" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view applicants for your own jobs" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("candidate", "name email resume resumeAnalysis"); // ← FIX: added resume + resumeAnalysis

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ message: "Candidate only" });
    }

    const applications = await Application.find({ candidate: req.user.id })
      .populate("job")
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Recruiter only" });
    }

    const application = await Application.findById(req.params.applicationId)
      .populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only update applications for your own jobs" });
    }

    application.status = req.body.status;
    await application.save();

    if (req.body.status === "Selected") {

    const fullApplication = await Application.findById(
    application._id
    )
    .populate("candidate", "name email")
    .populate("job", "title");

    await sendEmail(
    fullApplication.candidate.email,
    "Congratulations! You Have Been Selected",
    `
    Congratulations ${fullApplication.candidate.name} 🎉

      <p>Your application for the role of
      <strong>${fullApplication.job.title}</strong>
      has been selected.</p>

      <p>The recruiter will contact you soon regarding the interview schedule.</p>

      <br>

      <p>Best Regards,</p>
      <p>HireHub Team</p>
    `

    );
    }

    res.status(200).json(application);
  } catch (error) {
  console.error(error);
  res.status(500).json({
    message: error.message,
    stack: error.stack,
  });
}
};

module.exports = { applyJob, getApplicants, updateStatus, getMyApplications };