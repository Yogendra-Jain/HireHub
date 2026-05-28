const express = require("express");
const protect = require("../middleware/auth.middleware");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected profile route",
    user: req.user,
  });
});

module.exports = router;