const User = require("../models/user.model");

// ─────────────────────────────────────────────────────────────
// isAdmin Middleware
//
// Used on all admin routes to ensure only admins can access them.
//
// How it works:
//   1. auth.middleware already ran and set req.user from the JWT
//   2. This middleware reads the user from the database
//   3. Checks if their role is "admin"
//   4. If yes → continue (next())
//   5. If no  → return 403 Forbidden
//
// Usage in routes:
//   router.get("/stats", protect, isAdmin, getStats)
//   protect runs first (checks token), then isAdmin (checks role)
// ─────────────────────────────────────────────────────────────

const isAdmin = async (req, res, next) => {
  try {
    // req.user.id is set by auth.middleware after JWT verification
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only.",
      });
    }

    next(); // user is admin, allow the request through
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = isAdmin;