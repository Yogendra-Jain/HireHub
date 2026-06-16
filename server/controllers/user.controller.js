const User = require("../models/user.model");

// ─────────────────────────────────────────────────────────────
// uploadResume Controller
//
// BUG FIXED: After upload, the frontend Profile page was not
// showing the uploaded resume because:
//
//   1. The old controller saved the URL to MongoDB ✅
//   2. But it returned only { message, resume } in the response
//   3. The Profile page never updated localStorage after upload
//   4. So on refresh, user.resume in localStorage was still empty
//      → "No resume" state shown, Analyze button never appeared
//
// FIX: Return the full updated user in the response.
// The frontend then updates localStorage with the new user data.
// ─────────────────────────────────────────────────────────────

const uploadResume = async (req, res) => {
  try {
    // req.file is populated by multer-cloudinary middleware
    // It has: path (Cloudinary URL), originalname, mimetype, etc.
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save the Cloudinary URL to user's record in MongoDB
    // { new: true } returns the UPDATED document, not the old one
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resume: req.file.path },   // req.file.path = Cloudinary URL
      { new: true }                 // return updated doc
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return everything the frontend needs to update localStorage
    res.status(200).json({
      message: "Resume uploaded successfully",
      resume:  user.resume,

      // FIX: return updated user so frontend can update localStorage
      // This way the profile page instantly knows a resume is uploaded
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        resume: user.resume,       // ← the key addition
      },
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResume };