const User    = require("../models/user.model");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────
// BUG FIX #5 — Resume disappears after logout/login
//
// Root cause: loginUser returned only { _id, name, email, role }
// It never included `resume` or `resumeAnalysis` in the response.
// So when the frontend did localStorage.setItem("user", response)
// the saved user had no resume URL — even if one existed in MongoDB.
//
// Fix: Include `resume` and `resumeAnalysis` in BOTH
// loginUser and registerUser responses.
// Now after login, user.resume is immediately available in
// localStorage, so Profile.jsx can show the resume link
// without requiring re-upload.
// ─────────────────────────────────────────────────────────────

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id:            user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        resume:         user.resume         || "",   // ← FIX: include resume
        resumeAnalysis: user.resumeAnalysis || null, // ← FIX: include analysis
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // FIX: Return resume + resumeAnalysis so they are saved to
    // localStorage on login. This means candidates don't need to
    // re-upload their resume after logging out and back in.
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id:            user._id,
        name:           user.name,
        email:          user.email,
        role:           user.role,
        resume:         user.resume         || "",   // ← was missing
        resumeAnalysis: user.resumeAnalysis || null, // ← was missing
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };