import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/models.user";
import Video from "@/models/models.video";

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        
        if (!id) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        console.log(user.watchLater);

        // Fetch full video data for all videos in watchLater
        const watchLaterVideos = await Video.find({
            '_id': { $in: user.watchLater.map(video => video.videoId) }
        }).lean();



        return NextResponse.json({ 
            data: watchLaterVideos,
            pausWatchedHistory: user.pausWatchedHistory 
        }, { status: 200 });
    } catch (error) {
        console.error("Error in get-watch-later:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}
