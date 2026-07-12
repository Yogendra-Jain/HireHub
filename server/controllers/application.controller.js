const Application = require("../models/application.model");
const Job = require("../models/job.model");
const sendEmail = require("../utils/sendEmail");


// APPLY JOB
const applyJob = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ message: "Candidate only" });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existing = await Application.findOne({
      candidate: req.user.id,
      job: req.params.jobId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await Application.create({
      candidate: req.user.id,
      job: req.params.jobId,
    });

    res.status(201).json({
      message: "Application submitted",
      application,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET APPLICANTS
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
      return res.status(403).json({
        message: "You can only view applicants for your own jobs",
      });
    }

    const applications = await Application.find({
      job: req.params.jobId,
    }).populate(
      "candidate",
      "name email resume resumeAnalysis"
    );

    res.status(200).json(applications);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// MY APPLICATIONS
const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== "candidate") {
      return res.status(403).json({ message: "Candidate only" });
    }

    const applications = await Application.find({
      candidate: req.user.id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE APPLICATION STATUS
const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Recruiter only" });
    }

    const application = await Application.findById(
      req.params.applicationId
    ).populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    if (application.job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only update applications for your own jobs",
      });
    }

    application.status = req.body.status;
    await application.save();


    // SEND EMAIL WHEN SELECTED (Asynchronously in background)
    if (req.body.status === "Selected") {
      Application.findById(application._id)
        .populate("candidate", "name email")
        .populate("job", "title")
        .then((fullApplication) => {
          if (fullApplication && fullApplication.candidate) {
            sendEmail(
              fullApplication.candidate.email,
              "Congratulations! You Have Been Selected 🎉",
              `
              <h2>Congratulations ${fullApplication.candidate.name} 🎉</h2>
              <p>Your application for <strong>${fullApplication.job.title}</strong> has been selected.</p>
              <p>Recruiter will contact you soon.</p>
              <br>
              <p>Best Regards,</p>
              <p>HireHub Team</p>
              `
            )
              .then(() => {
                console.log("Selection email sent");
              })
              .catch((mailError) => {
                console.log("Email failed:", mailError.message);
              });
          }
        })
        .catch((err) => {
          console.log("Failed to load application details for email:", err.message);
        });
    }


    res.status(200).json({
      message: "Status updated",
      application,
    });

  } catch (error) {

    console.log(error);

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