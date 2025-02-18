import { NextResponse } from "next/server";
import User from "@/models/models.user";
import connectDB from "../../../lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const videoId = searchParams.get('videoId');
        const userId = searchParams.get('userId');

        if (!videoId || !userId) {
            return NextResponse.json({ message: "Video ID and User ID are required" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isInWatchLater = user.watchLater?.some(item => item.videoId === videoId) || false;

        return NextResponse.json({ 
            isInWatchLater
        }, { status: 200 });

    } catch (error) {
        console.error("Error in check-watch-later:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
} 