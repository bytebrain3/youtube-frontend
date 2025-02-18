import { NextResponse } from "next/server"
import User from "@/models/models.user"
import Video from "@/models/models.video"
import connectDB from "@/lib/db"
import { cacheUtils, CACHE_DURATION } from "@/lib/cache"

async function getUser(id) {
  const cachedUser = cacheUtils.get(id)
  if (cachedUser) {
    return cachedUser
  }
  const user = await User.findOne({ _id: id })
  if (user) {
    cacheUtils.set(id, user, CACHE_DURATION)
  }
  return user
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const index = url.searchParams.get("index") || "1"
    const userID = url.searchParams.get("userID")
    const MAX_VIDEOS = url.searchParams.get("MAX_VIDEOS") || "10"

    const page = Number.parseInt(index)
    const limit = Number.parseInt(MAX_VIDEOS)
    const skip = (page - 1) * limit

    if (!userID) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    await connectDB()

    const user = await getUser(userID)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const videos = await Video.find({ userId: userID })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .skip(skip)
      .limit(limit)

    if (!videos || videos.length === 0) {
      return NextResponse.json({ message: "No videos found", videos: [], totalPages: 0 }, { status: 200 })
    }

    const totalVideos = await Video.countDocuments({ userId: userID })
    const totalPages = Math.ceil(totalVideos / limit)

    return NextResponse.json({ videos, totalPages, currentPage: page }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 })
  }
}

