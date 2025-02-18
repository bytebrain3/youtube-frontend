import { NextResponse } from "next/server";
import Video from "../../../models/models.video";
import connectDB from "../../../lib/db";
import User from "../../../models/models.user";
export async function DELETE(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const videoId = url.searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ message: "Video ID is required" }, { status: 400 });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    await video.deleteOne();
    const user = await User.findByIdAndUpdate(video.userId,{$inc:{totalVideo:-1}})
    if(!user){
      return NextResponse.json({message:"User not found"},{status:404})
    }
    return NextResponse.json({ message: "Video deleted" }, { status: 200 });

  } catch (err) {
    console.error('Delete video error:', err);
    return NextResponse.json(
      { message: `Internal Server Error: ${err.message}` },
      { status: 500 }
    );
  }
}
