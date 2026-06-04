const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const {
  chatWithAI,
} = require("../controllers/chat.controller");

router.post("/", protect, chatWithAI);

module.exports = router;