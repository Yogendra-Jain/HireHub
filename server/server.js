const dotenv = require("dotenv");
dotenv.config(); // MUST be first

const express      = require("express");
const cors         = require("cors");
const connectDB    = require("./config/db");

const authRoutes        = require("./routes/auth.routes");
const jobRoutes         = require("./routes/job.routes");
const applicationRoutes = require("./routes/application.routes");
const userRoutes        = require("./routes/user.routes");
const aiRoutes          = require("./routes/ai.routes");
const chatRoutes        = require("./routes/chat.routes");
const jobMatchRoutes    = require("./routes/jobMatch.routes");
const interviewRoutes   = require("./routes/interview.routes");
const adminRoutes       = require("./routes/admin.routes"); 
const interviewScheduleRoutes = require("./routes/interviewSchedule.routes");
const interviewManagementRoutes = require( "./routes/interviewManagement.routes");

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth",         authRoutes);
app.use("/api/jobs",         jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/ai",           aiRoutes);
app.use("/api/chat",         chatRoutes);
app.use("/api/job-match",    jobMatchRoutes);
app.use("/api/interview",    interviewRoutes);
app.use("/api/admin",        adminRoutes); // NEW
app.use("/api/interview-schedule", interviewScheduleRoutes );
app.use("/api/interview-management",interviewManagementRoutes);

app.get("/", (req, res) => res.send("HireHub API running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));