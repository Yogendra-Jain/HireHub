const User = require("../models/user.model");
const Job = require("../models/job.model");
const Application = require("../models/application.model");
const getJobMatch = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const user = await User.findById(req.user.id);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      return res.status(404).json({
        message: "User or Job not found",
      });
    }

    const candidateSkills =
      user.resumeAnalysis?.skills || [];

    const requiredSkills =
      job.requiredSkills || [];

    const matchedSkills =
      requiredSkills.filter(skill =>
        candidateSkills.some(
          candidateSkill =>
            candidateSkill.toLowerCase() ===
            skill.toLowerCase()
        )
      );

    const missingSkills =
      requiredSkills.filter(skill =>
        !candidateSkills.some(
          candidateSkill =>
            candidateSkill.toLowerCase() ===
            skill.toLowerCase()
        )
      );

    const matchScore =
      requiredSkills.length > 0
        ? Math.round(
          (matchedSkills.length /
            requiredSkills.length) *
          100
        )
        : 0;

    let recommendation = "";

    if (matchScore >= 80) {
      recommendation = "Excellent Match";
    }
    else if (matchScore >= 60) {
      recommendation = "Good Match";
    }
    else {
      recommendation =
        "Needs Skill Improvement";
    }

    res.status(200).json({
      matchScore,
      matchedSkills,
      missingSkills,
      recommendation,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getApplicantsMatch = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Recruiter only",
      });
    }

    const job =
      await Job.findById(
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
          "You can only view your own jobs",
      });
    }
    const applications =
      await Application.find({
        job: req.params.jobId,
      }).populate("candidate");

    const applicantsWithScore = [];

    for (const application of applications) {

      const candidateSkills =
        candidate.resumeAnalysis?.skills || [];

      const requiredSkills =
        job.requiredSkills || [];

      const matchedSkills =
        requiredSkills.filter(skill =>
          candidateSkills.some(
            candidateSkill =>
              candidateSkill.toLowerCase() ===
              skill.toLowerCase()
          )
        );

      const missingSkills =
        requiredSkills.filter(skill =>
          !candidateSkills.some(
            candidateSkill =>
              candidateSkill.toLowerCase() ===
              skill.toLowerCase()
          )
        );

      const matchScore =
        requiredSkills.length > 0
          ? Math.round(
            (matchedSkills.length /
              requiredSkills.length) *
            100
          )
          : 0;

      let recommendation = "";

      if (matchScore >= 90) {
        recommendation =
          "Strongly Recommended";
      }
      else if (matchScore >= 70) {
        recommendation =
          "Recommended";
      }
      else if (matchScore >= 50) {
        recommendation =
          "Potential Candidate";
      }
      else {
        recommendation =
          "Needs More Skills";
      }

      applicantsWithScore.push({
        applicationId:
          application._id,

        candidateId:
          candidate._id,

        name:
          candidate.name,

        email:
          candidate.email,

        status:
          application.status,

        matchScore,

        matchedSkills,

        missingSkills,

        recommendation,
      });
    }
    applicantsWithScore.sort(
      (a, b) =>
        b.matchScore -
        a.matchScore
    );
    res.status(200).json(
      applicantsWithScore
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getJobMatch,
  getApplicantsMatch,
};