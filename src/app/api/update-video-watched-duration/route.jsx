import { NextRequest, NextResponse } from "next/server";
import User from "../../../models/models.user";
import connectDB from "../../../lib/db";
import { Cache } from 'memory-cache';


// Create a cache instance with proper typing
const userCache = new Cache();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // milliseconds

async function getUser(id) {
  // Check cache first
  const cachedUser = userCache.get(id);
  if (cachedUser) {
    return cachedUser;
  }

  // If not in cache, fetch from DB
  const user = await User.findById({ _id : id });
  if (user) {
    userCache.put(id, user, CACHE_DURATION);
  }
  return user;
}

async function updateUserWithRetry(user , videoId, durationNumber, userid) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (!user.watchHistory) {
        user.watchHistory = [];
      }

      const watchedVideoIndex = user.watchHistory.findIndex(
        (watchedVideo) => watchedVideo.videoId === videoId
      );

      if (watchedVideoIndex !== -1) {
        user.watchHistory[watchedVideoIndex].watchedAt = new Date();
        user.watchHistory[watchedVideoIndex].duration = durationNumber;
      } else {
        user.watchHistory.push({
          videoId,
          watchedAt: new Date(),
          duration: durationNumber,
        });
      }

      user.markModified('watchHistory');
      await user.save();

      // Update cache after successful save
      userCache.put(userid, user, CACHE_DURATION);
      return true;
    } catch (error) {
      if (error.message.includes('version') && attempt < MAX_RETRIES - 1) {
        // Refresh user data from database
        user = await User.findById({ _id: userid });
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      throw error;
    }
  }
  return false;
}

export async function PUT(request) {
  try {
    const formData = await request.formData();

    const videoId = formData.get("videoId") ;
    const userid = formData.get("userid") ;
    const duration = formData.get("duration");

    if (!videoId || !userid || !duration) {
      return NextResponse.json(
        { message: "Invalid request. Missing required fields." },
        { status: 400 }
      );
    }

    const durationNumber = parseFloat(duration);
    if (isNaN(durationNumber)) {
      return NextResponse.json(
        { message: "Invalid duration value." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await getUser(userid);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updateSuccess = await updateUserWithRetry(user, videoId, durationNumber, userid);
    
    if (!updateSuccess) {
      return NextResponse.json(
        { message: "Failed to update after multiple retries" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Watch duration updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating watch duration:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
