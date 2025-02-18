import { NextResponse } from "next/server";
import User from "@/models/models.user";
import connectDB from "../../../lib/db";
import Video from "@/models/models.video";

export async function POST(req) {
    try {
        const { videoId, id } = await req.json();
        
        if (!videoId || !id) {
            return NextResponse.json({ message: "Video ID and User ID are required" }, { status: 400 });
        }

        await connectDB();
        
        
        
        // Find and update user
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Initialize watchLater array if it doesn't exist
        if (!user.watchLater) {
            user.watchLater = [];
        }
        console.log(user.watchLater);

        // Check if video is already in watch later
        const videoIndex = user.watchLater.findIndex(item => item.videoId === videoId);
        if (videoIndex !== -1) {
            // Remove video if it exists
            user.watchLater.splice(videoIndex, 1);
            await user.save();
        } else {
            // Add video if it doesn't exist
            const video = await Video.findById(videoId);
            if (!video) {
                return NextResponse.json({ message: "Video not found" }, { status: 404 });
            }
            
            // Create watch later object matching schema
            const watchLaterVideo = {
                videoId: video._id.toString(),
                title: video.title,
                thumbnailUrl: video.thumbnailUrl,
                channel_name: video.channel_name,
                channel_username: video.channel_username,
                views: Number(video.views || 0),
                duration: String(video.duration || "00:00:00")
            };
            
            // Add to watch later array
            user.watchLater.push(watchLaterVideo);
            await user.save();
        }

        // Fetch the updated user to get the current watchLater array
        const updatedUser = await User.findById(id);
        console.log(updatedUser.watchLater);
        return NextResponse.json({ 
            message: "Watch later updated",
            data: updatedUser.watchLater
        }, { status: 200 });


    } catch (error) {
        console.error("Error in update-watch-later:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}

