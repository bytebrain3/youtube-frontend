import { NextRequest, NextResponse } from "next/server";
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
    const video = await Video.findById({ _id: videoId }); // fixed query
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }
    if (id) {
      const user = await User.findById({ _id : id });
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
      const userUID = user._id.toString();
      console.log("user uuid ", userUID);

      // Check if video is already in watch history

      if (video.userId.toString() === userUID) {
        const existingWatch = user.watchHistory?.find(
          (item) => item?.videoId?.toString() === videoId
        );
        if (existingWatch) {
          return NextResponse.json(
            { message: "Video already in watch history" },
            { status: 400 }
          );
        }
      }

      // Add to watch history
      const videoWatched = {
        videoId,
        watchedAt: new Date(),
      };

      if (user.pausWatchedHistory === false) {
        if (!Array.isArray(user.watchHistory)) {
          user.watchHistory = [];
        }

        user.watchHistory.push(videoWatched);
        await user.save();
      }

      // Update views count - fixed update operation
      await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    } else {
      try {
        // Update views count
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

        return NextResponse.json(
          { message: "Video views incremented because you are  😊 annonomus " },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json({ message: error }, { status: 404 });
      }
    }

    return NextResponse.json({ message: "Video viwes inc" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
