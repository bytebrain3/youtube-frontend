import { NextRequest, NextResponse } from "next/server";
import Video from "@/models/models.video";
import User from "@/models/models.user";
import connectDB from "../../../lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        await connectDB();
        const user = await User.findById({ _id : id }).populate("likedVideo");
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        const likedsVideo = user.likedVideo;
        const videos = await Video.find({ _id: { $in: likedsVideo } }); // Fetch individual videos
        if (!videos) {
            return NextResponse.json({ message: "Videos not found" }, { status: 404 });
        }

        return NextResponse.json({ videos }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}