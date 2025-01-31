import { NextRequest, NextResponse } from "next/server";
import User from "../../../models/models.user";
import connectDB from "../../../lib/db"; // Make sure you have this connection utility

export async function POST(request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json(
                { message: "id is required" },
                { status: 400 }
            );
        }
        await connectDB();
        const user = await User.findByIdAndUpdate(
            { _id: id },
            { $set: { isChannel: true } },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { user: user },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: `Internal Server Error ${error}` },
            { status: 500 }
        );
    }
}