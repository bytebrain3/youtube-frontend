import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Video from "@/models/models.video";

export async function GET(request, { params }) {
    try {
        await connectDB();

        // Get query from params and await it
        const query = await params.query;
        console.log(query);
        
        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // Search in MongoDB
        const videos = await Video.find({
            $or: [
                { title: { $regex: new RegExp(query, 'i') } },
                { description: { $regex: new RegExp(query, 'i') } }
            ]
        });


        // Format the response without populate
        const formattedVideos = videos.map(video => ({
            videoId: video._id,
            thumbnailUrl: video.thumbnailUrl,
            title: video.title,
            channel_name: video.channel_name || '',
            channel_icon: video.channel_icon || '',
            views: video.views,
            createdAt: video.createdAt,
            duration: video.duration
        }));

        return NextResponse.json({ videos: formattedVideos });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
} 