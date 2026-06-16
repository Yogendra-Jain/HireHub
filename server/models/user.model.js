const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────
// User Model
//
// Change from original:
//   role enum now includes "admin" in addition to
//   "candidate" and "recruiter"
//
// To create an admin user, run this once in MongoDB shell:
//   db.users.updateOne(
//     { email: "admin@hirehub.com" },
//     { $set: { role: "admin" } }
//   )
// ─────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
    },
    email: {
      type:     String,
      required: true,
      unique:   true,
    },
    password: {
      type:     String,
      required: true,
    },

    // Added "admin" to the enum
    role: {
      type:    String,
      enum:    ["candidate", "recruiter", "admin"],
      default: "candidate",
    },

    resume: {
      type:    String,
      default: "",
    },

    resumeAnalysis: {
      type:    mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);