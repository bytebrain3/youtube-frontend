import Image from "next/image";
import { X, Trash2, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/format-time";

export function VideoHistoryItem({ video, onRemove }) {
  const { data: session } = useSession();

  // Add helper function to convert time string to seconds
  const timeToSeconds = (timeString) => {
    const parts = timeString.split(":");
    if (parts.length === 3) {
      // HH:MM:SS
      return +parts[0] * 3600 + +parts[1] * 60 + +parts[2];
    }
    if (parts.length === 2) {
      // MM:SS
      return +parts[0] * 60 + +parts[1];
    }
    return +timeString; // Already in seconds
  };

  const removeWatchedVideo = async (videoId) => {
    try {
      const formData = new FormData();
      formData.append("videoId", videoId);
      formData.append("userid", session?.user?.id || "");
      const response = await fetch("/api/remove-watched-video", {
        method: "DELETE",
        body: formData,
      });
      if (response.ok) {
        onRemove(videoId); // Update parent state instead of refreshing
      }
    } catch (error) {
      console.error("Error removing video:", error);
    }
  };

  const durationInSeconds = timeToSeconds(video.duration);
  const watchedPercentage = (video.WatchedDuration / durationInSeconds) * 100;

  console.log(`watched duration: ${watchedPercentage}%`);

  return (
    <div className="w-full group relative p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
      <div className="flex gap-2 sm:gap-4">
        <Link
          href={`/videos/${video.videoId}`}
          className="relative aspect-video w-32 sm:w-40 shrink-0"
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover rounded-lg"
          />
          <div className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-white dark:text-white text-xs">
            {video.duration}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
            <div
              className="h-full bg-red-600"
              style={{
                width: `${Math.min(watchedPercentage, 100)}%`,
              }}
            />
          </div>
        </Link>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <Link href={`/videos/${video.videoId}`}>
            <h3 className="font-medium hover:text-blue-600 line-clamp-2">{video.title}</h3>
          </Link>
          <Link
            href={`/channel/@${video.username}`}
            className="text-sm text-gray-600 hover:text-blue-600 truncate"
          >
            {video.channel}
          </Link>
          <div className="text-sm text-gray-600 truncate">
            {video.views} views • {formatTimeAgo(video.createdAt)}
          </div>
        </div>
        <button
          onClick={() => removeWatchedVideo(video.videoId)}
          className="self-start p-1 sm:p-2 hover:bg-gray-200 rounded-full transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
