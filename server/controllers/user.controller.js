const User = require("../models/user.model");

const uploadResume = async (req, res) => {
  try {
    console.log("FILE:", req.file);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        resume: req.file.path,
      },
      {
        new: true,
      }
    );

    console.log("UPDATED USER:", user);

    res.status(200).json({
      message: "Resume uploaded successfully",
      resume: user.resume,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadResume,
};