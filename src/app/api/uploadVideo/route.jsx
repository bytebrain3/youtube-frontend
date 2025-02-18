import { NextResponse } from "next/server";
import User from "@/models/models.user";
import Video from "@/models/models.video";
import connectDB from "@/lib/db";

export async function POST(request) {
  try {
    // Ensure database connection
    await connectDB();

    // Parse form data
    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const videoId = formData.get("videoId")?.toString();
    const thumbnailUrl = formData.get("thumbnail")?.toString();
    const tags = formData.get("tags")?.toString();
    const userId = formData.get("userid")?.toString();
    const duration = formData.get("duration")?.toString() || "00:00:00";

    // Validate required fields
    if (!title || !description || !videoId || !thumbnailUrl) {
      return NextResponse.json(
        { message: "Please fill all required fields" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findByIdAndUpdate(userId,{$inc:{totalVideo:1}})
    if(!user){
      return NextResponse.json({message:"User not found"},{status:404})
    }
    



    // Channel info
    const channelName = user.full_name || "Unknown Channel";
    const channelIcon = user.profile_image_url || "/default-avatar.png";
    

    // Video data object
    const videoData = new Video({
      title,
      description,
      _id: videoId,
      videoId,
      thumbnailUrl,
      tags: tags ? tags.split(",") : [],
      userId: user._id.toString(),
      duration,
      channel_name: channelName,
      channel_username: user.login,
      channel_icon: channelIcon,
    });

    // Save video to DB
    await videoData.save();
    return NextResponse.json(
      { message: "Video uploaded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading video:", error);

    // Handle specific errors
    if (error.message?.includes("buffering timed out")) {
      return NextResponse.json(
        { message: "Database connection timed out. Please try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
