import { NextRequest, NextResponse } from "next/server";
import User from "../../../models/models.user";
import connectDB from "../../../lib/db";

export async function DELETE(request) {
  try {
    const formData = await request.formData();
    const videoId = formData.get("videoId") ;
    const userid = formData.get("userid") ;

    if (!videoId || !userid) {
      return NextResponse.json(
        { message: "Please fill all the fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update the user document by pulling the matching videoId from watchHistory
    const result = await User.updateOne(
      { _id: userid },
      { 
        $pull: { 
          watchHistory: { videoId: videoId }
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Video not found in watch history" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Video removed from watch history successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error removing video:", error);
    return NextResponse.json(
      { message: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
