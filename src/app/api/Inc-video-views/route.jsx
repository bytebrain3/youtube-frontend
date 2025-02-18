import {  NextResponse } from "next/server";
import Video from "@/models/models.video";
import User from "@/models/models.user";
import connectDB from "../../../lib/db";


export async function POST(req) {
  try {
    const { videoId, id } = await req.json();
    if (!videoId) {
      return NextResponse.json(
        { message: "Video ID not provided" },
        { status: 400 }
      );
    }

    await connectDB();
    const video = await Video.findById({ _id: videoId });
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    // Handle authenticated users
    if (id) {
      const user = await User.findById({ _id: id });
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      const userUID = user._id.toString();

      // Check if video is already in watch history
      if (video.userId.toString() === userUID) {
        const existingWatch = user.watchHistory?.find(
          (item) => item?.videoId?.toString() === videoId
        );
        if (existingWatch) {
          return NextResponse.json(
            { message: "Video already in watch history", views: video.views },
            { status: 400 }
          );
        }
      }

      // Add to watch history if not paused
      if (user.pausWatchedHistory === false) {
        if (!Array.isArray(user.watchHistory)) {
          user.watchHistory = [];
        }

        user.watchHistory.push({
          videoId,
          watchedAt: new Date(),
        });
        await user.save();
      }

      // Update views count for authenticated user
      const updatedVideo = await Video.findByIdAndUpdate(
        videoId, 
        { $inc: { views: 1 } },
        { new: true }
      );

      return NextResponse.json(
        { message: "Video views incremented", views: updatedVideo.views },
        { status: 200 }
      );
    }

    // Handle anonymous users
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId, 
      { $inc: { views: 1 } },
      { new: true }
    );

    return NextResponse.json(
      { message: "Video views incremented (anonymous user)", views: updatedVideo.views },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
