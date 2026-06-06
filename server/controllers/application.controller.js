const Application = require("../models/application.model");
const Job = require("../models/job.model");

const applyJob = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        message: "Candidate only",
      });
    }
    const jobId = req.params.jobId;
    const candidateId = req.user.id;

    const existingApplication =
      await Application.findOne({
        candidate: candidateId,
        job: jobId,
      });

    if (existingApplication) {
      return res.status(400).json({
        message: "Already applied",
      });
    }

    const application =
      await Application.create({
        candidate: candidateId,
        job: jobId,
      });

    res.status(201).json({
      message: "Application submitted",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const getApplicants = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Recruiter only",
      });
    }

    const job = await Job.findById(
      req.params.jobId
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (
      job.recruiter.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can only view applicants for your own jobs",
      });
    }

    const applications = await Application.find({
      job: req.params.jobId,
    }).populate("candidate", "name email");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({
        message: "Candidate only",
      });
    }
    const applications = await Application.find({
      candidate: req.user.id,
    }).populate("job");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Recruiter only",
      });
    }

    const application = await Application.findById(
      req.params.applicationId
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (
      application.job.recruiter.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can only update applications for your own jobs",
      });
    }

    application.status = req.body.status;

    await application.save();

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  applyJob,
  getApplicants,
  updateStatus,
  getMyApplications,
};