// app/api/videoInfo/[videoId]/route.ts
import { NextResponse } from 'next/server';
import Video from '@/models/models.video';
import connectDB from '@/lib/db';
import User from '@/models/models.user';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, context) {
  try {
    await connectDB();
    const { videoId } = context.params;

    const video = await Video.findById(videoId);
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    const userWithHistory = await User.findOne({
      "watchHistory.videoId": videoId
    });

    const watchDuration = userWithHistory?.watchHistory?.find(
      (history) => history.videoId === videoId
    )?.duration || 0;

    return NextResponse.json({
      success: true,
      data: video,
      video_watch_duration: watchDuration
    });
    
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching video' },
      { status: 500 }
    );
  }
}