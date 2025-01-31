import { NextRequest, NextResponse } from "next/server";
import User from "../../../models/models.user";
import Video from "../../../models/models.video";
import connectDB from "../../../lib/db"; // Make sure you have this connection utility

export async function POST(request) {
  try {
    const formData = await request.formData();

    const videoId = formData.get("videoId") ;
    const userid = formData.get("userid") ;

    if (!videoId) {
      return NextResponse.json(
        { message: "video not found" },
        { status: 400 }
      );
    }
    if(!userid){
      return NextResponse.json(
        { message: "user not login" },
        { status: 400 }
      );
    }

    // Connect to MongoDB first
    await connectDB();

    const video = await Video.findById({ _id : videoId });
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }
    const user = await User.findById({ _id: userid });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.likedVideo.includes(videoId)) {
      user.likedVideo.push(videoId); // Add the videoId to likedVideo array
      await user.save(); // Save the updated user

      video.likes += 1; // Increment the likes count on the video
      await video.save(); // Save the updated video
    }

    return NextResponse.json({ message: "Video liked successfully" , status: 200 , likeCount : video.likes});

    // Check if the video exists in the database
    // If not, return 404
    // If yes, check if the user has already liked the video
    // If yes, return 400
    // If no, add the like to the video and return 200
    return NextResponse.json({ message: "Video liked successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: `Internal Server Error ${error}` },
      { status: 500 }
    );
  }
}
