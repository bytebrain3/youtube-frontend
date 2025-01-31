import { NextResponse } from "next/server";
import Video from "../../../models/models.video";
import connectDB from "../../../lib/db";

export async function GET() {
  try {
    await connectDB();
    const videos = await Video.find({}).lean();
    
    return NextResponse.json({ success: true, data: videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
