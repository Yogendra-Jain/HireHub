const mongoose = require("mongoose");

const jobMatchSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      default: "",
    },
    aiInsight: {
      type: String,
      default: "",
    },
    // Track which resume version this was computed on
    // so we can invalidate cache if resume is re-analyzed
    resumeAnalysisSnapshot: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// One cache entry per candidate+job pair
jobMatchSchema.index({ candidate: 1, job: 1 }, { unique: true });

const JobMatch = mongoose.model("JobMatch", jobMatchSchema);

module.exports = JobMatch;