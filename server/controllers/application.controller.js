const Application = require("../models/application.model");

const applyJob = async (req, res) => {
  try {
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
    const application = await Application.findByIdAndUpdate(
      req.params.applicationId,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );

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