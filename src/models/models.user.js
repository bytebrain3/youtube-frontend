import mongoose from "mongoose";

const WatchedTimeSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },
  watchedAt: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    default: 0,
  },
});

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profile_image_url: {
      type: String,
      required: true,
    },
    profile_cover_url: {
      type: String,
      required: false,
    },
    isChannel: {
      type: Boolean,
      required: true,
      default: false,
    },
    likedVideo: {
      type: [String],
    },
    watchHistory: {
      type: [WatchedTimeSchema], // Updated to store objects
    },
    github_id: {
      type: String,
      required: true,
      unique: true,
    },
    login: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },

    last_synced: {
      type: Date,
      default: Date.now,
    },
    totalVideo: {
      type: Number,
    },
    description: {
      type: String,
    },
    youtube_url: {
      type: String,
    },
    username: {
      type: String,
      require : true,
    },
    Subscribers: {
      type: String,
      default: 0,
    },
    pausWatchedHistory : {
      type : Boolean,
      default : false
    },
    subscriberTo: {
      type: String,
    },
  },
  { timestamps: true } // Removed _id: false
);

// Check if model exists before compiling
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
