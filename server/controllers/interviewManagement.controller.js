const Interview = require("../models/interview.model");
const sendEmail = require("../utils/sendEmail");


// GET RECRUITER INTERVIEWS
const getRecruiterInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      recruiter: req.user.id,
    })
      .populate("candidate", "name email")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(interviews);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// RESCHEDULE INTERVIEW
const rescheduleInterview = async (req, res) => {
  try {

    const interview = await Interview.findById(
      req.params.id
    )
      .populate("candidate", "name email")
      .populate("job", "title");


    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }


    interview.date = req.body.date;
    interview.time = req.body.time;
    interview.meetingLink = req.body.meetingLink;
    interview.status = "Rescheduled";


    await interview.save();



    // SEND MAIL SAFELY (Asynchronously in background)
    sendEmail(
      interview.candidate.email,

      "Interview Rescheduled",

      `
      <h2>Hello ${interview.candidate.name}</h2>

      <p>Your interview has been rescheduled.</p>

      <p>
      <b>Job:</b> ${interview.job.title}
      </p>

      <p>
      <b>Date:</b> ${interview.date}
      </p>

      <p>
      <b>Time:</b> ${interview.time}
      </p>

      <a href="${interview.meetingLink}">
      Join Interview
      </a>

      <br/><br/>

      <p>Best Regards</p>
      <p>HireHub Team</p>
      `
    )
      .then(() => {
        console.log("Reschedule email sent");
      })
      .catch((mailError) => {
        console.log(
          "Email failed:",
          mailError.message
        );
      });



    res.status(200).json({
      message: "Interview rescheduled",
      interview,
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// CANCEL INTERVIEW
const cancelInterview = async (req, res) => {

  try {

    const interview = await Interview.findById(
      req.params.id
    )
      .populate("candidate", "name email")
      .populate("job", "title");



    if (!interview) {

      return res.status(404).json({
        message: "Interview not found",
      });

    }



    interview.status = "Cancelled";

    await interview.save();



    // SEND CANCEL MAIL SAFELY (Asynchronously in background)
    sendEmail(

      interview.candidate.email,


      "Interview Cancelled",


      `
      <h2>Hello ${interview.candidate.name}</h2>

      <p>
      Your interview for
      <b>${interview.job.title}</b>
      has been cancelled.
      </p>

      <br/>

      <p>HireHub Team</p>
      `
    )
      .then(() => {
        console.log("Cancel email sent");
      })
      .catch((mailError) => {
        console.log(
          "Email failed:",
          mailError.message
        );
      });



    res.status(200).json({

      message:"Interview cancelled",

      interview,

    });



  } catch (error) {


    res.status(500).json({

      message:error.message,

    });


  }

};




module.exports = {

  getRecruiterInterviews,

  rescheduleInterview,

  cancelInterview,

};