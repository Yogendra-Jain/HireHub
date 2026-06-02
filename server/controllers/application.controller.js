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

module.exports = {
  applyJob,
};