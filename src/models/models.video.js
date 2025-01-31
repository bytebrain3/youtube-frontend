import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Replace default ObjectId with custom videoId
      required: true,
    },
    videoId : {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true, // Index the field for faster querying
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    likes: {
      type: Number,
      required: true,
      default: 0,
    },
    tags: {
      type: [String],
      default: [], // Ensure default is an empty array instead of undefined
    },
    duration: {
      type: String,
      required: true,
      default: "00:00:00", // Default duration is 0 seconds
    },
    description: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing spaces
    },
    channel_name: {
      type: String,
      required: true,
    },
    channel_icon: {
      type: String,
      required: true,
    },
  },
  { 
    timestamps: true, // Automatically create createdAt and updatedAt fields
    _id: false  // Disable the default ObjectId field creation
  }
);

// Check if model exists before compiling
const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);

export default Video;
