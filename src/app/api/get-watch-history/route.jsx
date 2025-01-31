import { NextResponse } from "next/server";
import User from "@/models/models.user";
import Video from "@/models/models.video";
import connectDB from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "id is required" }, { status: 400 });
    }

    // Connect to the database
    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const watchHistory = user.watchHistory || [];

    // Fetch videos that match watchHistory videoIds
    const videos = await Video.find({
      videoId: { $in: watchHistory.map((entry) => entry.videoId) },
    });

    // Attach watched duration to each video
    const videosWithDuration = videos.map((video) => {
      const watchEntry = watchHistory.find(
        (entry) => entry.videoId === video.videoId
      );
      return {
        ...video.toObject(),
        WatchedDuration: watchEntry ? watchEntry.duration : 0,
      };
    });

    if (!videos.length) {
      return NextResponse.json(
        { message: "No videos found in watch history" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Watch history fetched successfully",
        data: videosWithDuration,
        pausWatchedHistory: user.pausWatchedHistory || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
