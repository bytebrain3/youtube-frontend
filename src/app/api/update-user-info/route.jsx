import { NextResponse } from "next/server";
import User from "@/models/models.user";
import connectDB from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function PUT(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { full_name, description, location, coverImage, profileImage } = await req.json();

    const user = await User.findByIdAndUpdate(session.user.id, {
      full_name: full_name,
      description: description,
      location: location,
      profile_cover_url: coverImage,
      profile_image_url: profileImage,
    });

    return NextResponse.json({ success: true, message: "User updated", user }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}