const Interview = require("../models/interview.model");
const Application = require("../models/application.model");
const sendEmail = require("../utils/sendEmail");

const scheduleInterview = async (req, res) => {
  try {

    // Only recruiters can schedule interviews
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Recruiter only"
      });
    }

    const { applicationId } = req.params;

    const {
      date,
      time,
      meetingLink
    } = req.body;

    // Find application
    const application = await Application.findById(applicationId)
      .populate("candidate", "name email")
      .populate("job");

    if (!application) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    // Create interview record
    const interview = await Interview.create({
      application: application._id,
      candidate: application.candidate._id,
      recruiter: req.user.id,
      job: application.job._id,
      date,
      time,
      meetingLink
    });

    // Send email
    try {

      await sendEmail(

        application.candidate.email,

        "Interview Scheduled",

        `
    <h2>Hello ${application.candidate.name}</h2>

    <p>Your interview has been scheduled.</p>

    <p>
    <b>Date:</b> ${date}
    </p>

    <p>
    <b>Time:</b> ${time}
    </p>

    <a href="${meetingLink}">
    Join Interview
    </a>

    <br/>

    <p>
    Please join 10 minutes early.
    </p>
    `
      );


      console.log("Interview mail sent");


    } catch (mailError) {

      console.log(
        "Interview mail failed:",
        mailError.message
      );

    }

    res.status(201).json(interview);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message
    });

  }
};

const getMyInterviews = async (req, res) => {
  try {

    if (req.user.role !== "candidate") {
      return res.status(403).json({
        message: "Candidate only"
      });
    }

    const interviews =
      await Interview.find({
        candidate: req.user.id
      })
        .populate("job", "title")
        .sort({ createdAt: -1 });

    res.status(200).json(interviews);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  scheduleInterview,
  getMyInterviews
};