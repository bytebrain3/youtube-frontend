import { NextRequest, NextResponse } from "next/server";
import User from "@/models/models.user";
import Video from "@/models/models.video";
import connectDB from "@/lib/db"; // Make sure you have this connection utility


export async function GET(request, { params }) {
    try {
        const username = params.username;
        // Get the session user ID from the Authorization header
        const sessionUserId = request.headers.get('Authorization');
        console.log("Searching for username:", username); // Debug log

        if (!username) {
            return NextResponse.json(
                { message: "Username is required" },
                { status: 400 }
            );
        }

        await connectDB();
        
        // Add debug logging
        const user = await User.findOne({ username: username });
        console.log("Database query result:", user); // Debug log

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Ensure arrays are initialized
        const subscribers = Array.isArray(user.Subscribers) ? user.Subscribers : [];

        return NextResponse.json({
            username: user.username || '',
            full_name: user.full_name || '',
            description: user.description || '',
            profileImage: user.profile_image_url || '/placeholder.svg',
            coverImage: user.profile_cover_url || '/next.svg',
            createdAt: user.createdAt || '',
            location: user.location || '',
            userID: user._id || '',
            totalVideo: user.totalVideo || 0,
            Subscribers: subscribers.length,
            isSubscribed: sessionUserId ? subscribers.includes(sessionUserId) : false,
        }, { status: 200 });

    } catch (error) {
        console.error("Detailed error:", error); // Enhanced error logging
        return NextResponse.json(
            { message: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}