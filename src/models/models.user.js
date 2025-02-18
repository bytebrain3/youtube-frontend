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

const WatchLaterSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  channel_name: {
    type: String,
    required: true
  },
  channel_username: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,  // Changed from Number to String to handle time format "HH:MM:SS"
    required: true
  }
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    description : {
      type : String,
      default : "",
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
    watchLater: {
      type: [WatchLaterSchema]
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
      default : 0,
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
    Subscribers: [{
      type: String,
      ref: 'User'
    }],
    SubscribedTo: [{
      type: String,
      ref: 'User'
    }],
    SubscricbersCount: {
      type: Number,
      default: 0,
    },
    pausWatchedHistory : {
      type : Boolean,
      default : false
    },



    subscriberTo: {
      type: [String],
    },
  },
  { timestamps: true }
);

// Add a middleware to update SubscricbersCount before saving
UserSchema.pre('save', function(next) {
  if (this.isModified('Subscribers')) {
    this.SubscricbersCount = this.Subscribers.length;
  }
  next();
});

// Check if model exists before compiling
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
