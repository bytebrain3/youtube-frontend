import { NextResponse } from "next/server";
import User from "@/models/models.user";
import connectDB from "@/lib/db";

export async function POST(request) {
    try {
        await connectDB();
        const { channelID, userID } = await request.json();

        if (!channelID || !userID) {
            return NextResponse.json(
                { success: false, message: "Channel ID and User ID are required" },
                { status: 400 }
            );
        }

        // Find the channel and user
        const channel = await User.findById(channelID);
        const user = await User.findById(userID);

        if (!channel || !user) {
            return NextResponse.json(
                { success: false, message: channel ? "User not found" : "Channel not found" },
                { status: 404 }
            );
        }

        // Initialize arrays if needed
        const subscribers = Array.isArray(channel.Subscribers) ? channel.Subscribers : [];
        const subscribedTo = Array.isArray(user.SubscribedTo) ? user.SubscribedTo : [];

        // Check if already subscribed
        const isSubscribed = subscribers.includes(userID);

        if (isSubscribed) {
            // Unsubscribe
            const updatedChannel = await User.findByIdAndUpdate(
                channelID,
                { 
                    $pull: { Subscribers: userID }
                },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userID,
                { 
                    $pull: { SubscribedTo: channelID }
                },
                { new: true }
            );

            return NextResponse.json({
                success: true,
                message: "Successfully unsubscribed",
                isSubscribed: false,
                subscriberCount: updatedChannel.Subscribers.length
            });
        } else {
            // Subscribe
            const updatedChannel = await User.findByIdAndUpdate(
                channelID,
                { 
                    $addToSet: { Subscribers: userID }
                },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userID,
                { 
                    $addToSet: { SubscribedTo: channelID }
                },
                { new: true }
            );

            return NextResponse.json({
                success: true,
                message: "Successfully subscribed",
                isSubscribed: true,
                subscriberCount: updatedChannel.Subscribers.length
            });
        }

    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error: " + error.message },
            { status: 500 }
        );
    }
}
