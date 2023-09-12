const mongoose = require("mongoose");

const showSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            trim: true,
            required: [true, "Address is requied"]
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        isLive: {
            type: Boolean,
            trim: true,
            default: false
        },
        showTitle: {
            type: String,
            trim: true,
            required: [true, "Show Title is requied"]
        },
        description: {
            type: String,
            trim: true,
            required: [true, "description is requied"]
        },
        date: {
            type: Date,
            trim: true,
            required: [true, "Date is requied"]
        },
        startTime: {
            type: String,
            trim: true,
            required: [true, "Start Time is requied"]
        },
        localDateTime: {
            type: Date,
            trim: true,
            required: [true, "Local Date Time Time is requied"]
        },
        utcDateTime: {
            type: Date,
            trim: true,
            required: [true, "Utc Date Time is requied"]
        },
        timezone: {
            type: String,
            trim: true,
            required: [true, "Time zone is required"]
        },
        radius: {
            type: Number,
            trim: true,
            required: [true, "Radius is requied"]
        },
        pre_show: {
            type: Boolean,
            trim: true,
            default: false
        },
        premp3: {
            fileName: {
                type: String,
                trim: true
            },
            filePath: {
                type: String,
                trim: true
            }
        },
        main_show: {
            type: Boolean,
            trim: true,
            default: false
        },
        mainmp3: {
            fileName: {
                type: String,
                trim: true,
                required: [true, "File is requied"]
            },
            filePath: {
                type: String,
                trim: true,
                required: [true, "File is requied"]
            }
        },
        post_show: {
            type: Boolean,
            trim: true,
            default: false
        },
        postmp3: {
            fileName: {
                type: String,
                trim: true
            },
            filePath: {
                type: String,
                trim: true
            }
        },
        createdBy : {
            type: mongoose.Types.ObjectId,
            ref : "user",
            trim: true,
            required: [true, "Created By is requied"]
        }
    },
    { timestamps: true }
);

showSchema.index({ location: '2dsphere' });
let Show = mongoose.model("show", showSchema);
module.exports = Show;
