const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
{
    application:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Application",
        required:true
    },

    candidate:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    recruiter:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true
    },

    date:{
        type:String,
        required:true
    },

    time:{
        type:String,
        required:true
    },

    meetingLink:{
        type:String,
        required:true
    },

    status:{
        type:String,
        default:"Scheduled"
    }
},
{
    timestamps:true
});

module.exports = mongoose.model(
    "Interview",
    interviewSchema
);