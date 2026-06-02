const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const {
  applyJob,
} = require("../controllers/application.controller");

router.post("/apply/:jobId",protect, applyJob );

module.exports = router;