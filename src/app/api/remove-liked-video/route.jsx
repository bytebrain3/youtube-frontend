import { NextRequest, NextResponse } from "next/server";
import User from "../../../models/models.user";
import Video from "../../../models/models.video";
import connectDB from "../../../lib/db"; // Make sure you have this connection utility

export async function DELETE(request) {
  try {
    const formData = await request.formData();

    const videoId = formData.get("videoId");
    const userid = formData.get("userid");

    if (!videoId || !userid) {
        return NextResponse.json(
          { message: "Please fill all the fields" },
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
    console.log('user like video',user.likedVideo);
    if(user.likedVideo.includes(videoId)){
      user.likedVideo.splice(user.likedVideo.indexOf(videoId), 1); // Remove the videoId from likedVideo array
      await user.save(); // Save the updated user

      video.likes -= 1; // Decrement the likes count on the video
      await video.save(); // Save the updated video
    }
    return NextResponse.json({ message: "Video Unliked successfully" , status: 200 , likeCount : video.likes});

  } catch (error) {
    return NextResponse.json(
      { message: `Internal Server Error ${error}` },
      { status: 500 }
    );
  }
}
