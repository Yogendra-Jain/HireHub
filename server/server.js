const dotenv = require("dotenv");
dotenv.config(); // MUST be first

const express      = require("express");
const cors         = require("cors");
const rateLimit    = require("express-rate-limit");
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

app.set("trust proxy",1);

app.use(express.json({
    limit:"10mb"
}));

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL
];

app.use(cors({

    origin:function(origin,callback){

        if(!origin || allowedOrigins.includes(origin)){
            callback(null,true);
        }
        else{
            callback(new Error("Not allowed by CORS"));
        }
    },

    credentials:true
}));


// COST/ABUSE PROTECTION: these routes all call paid third-party AI APIs
// (Gemini/Groq). Without a limit, one user or script could rack up a huge
// bill. 20 requests per 15 minutes per IP is generous for normal use but
// stops abuse.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many AI requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth",         authRoutes);
app.use("/api/jobs",         jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users",        userRoutes);
app.use("/api/ai",           aiLimiter, aiRoutes);
app.use("/api/chat",         aiLimiter, chatRoutes);
app.use("/api/job-match",    aiLimiter, jobMatchRoutes);
app.use("/api/interview",    aiLimiter, interviewRoutes);
app.use("/api/admin",        adminRoutes); // NEW
app.use("/api/interview-schedule", interviewScheduleRoutes );
app.use("/api/interview-management",interviewManagementRoutes);

app.get("/", (req, res) => res.send("HireHub API running"));

// GLOBAL ERROR HANDLER: previously there was none, so thrown errors
// (e.g. multer file-type/size rejections) fell through to Express's
// default HTML error page instead of a clean JSON response.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));