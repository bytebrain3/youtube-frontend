"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Maximize,
  ThumbsUp,
  Share2,
  ThumbsDown,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoSkeleton } from "@/components/skeleton/videoPlayerSkeleton";
import Image from "next/image";
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import ChatInterface from "@/components/ChatInterface";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const qualityOptions = ["auto", "360p", "420p", "720p", "1080p"];
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const [currentTime, setCurrentTime] = useState(0);
  const [title, setTitle] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelImage, setChannelImage] = useState("");
  const [subscribers, setSubscribers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [description, setDescription] = useState("");
  const [pip, setPip] = useState(true);
  const [debouncedProgress, setDebouncedProgress] = useState(0);
  const progressTimeoutRef = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("@dipmondal");

  const { data: session } = useSession();
  const [volume, setVolume] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("volume")) || 1;
    }
    return 1;
  });

  const params = useParams();
  const videoId = params.id;

  const containerRef = useRef(null);
  const playerRef = useRef(null);
  useEffect(() => {
    setIsMounted(true);
    setVolume(0.8);
    setIsPlaying(false);
    setSelectedQuality("auto");
    fetchVideoData();
    setTimeout(() => {
      fetchVideoViews();
    }, 3000);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("volume", volume.toString());
    }
  }, [volume]);

  const fetchVideoData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/videoInfo/${videoId}`);
      const video = response.data;
      if (!video) throw new Error("Video not found");

      setTitle(video.data.title);
      setChannelName(video.data.channel_name);
      setChannelImage(video.data.channel_icon);
      setViews(video.data.views);
      setSubscribers(video.data.subscribers);
      setLikes(video.data.likes);
      setDescription(video.data.description);

      const watchedDuration = Number.parseFloat(
        video.video_watch_duration || "0"
      );
      setCurrentTime(watchedDuration);
      setPlayed(watchedDuration);

      if (playerRef.current) {
        playerRef.current.seekTo(watchedDuration);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Error fetching video data:", err);
      setError("Failed to load video data");
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  const fetchVideoViews = async () => {
    try {
      console.log("Incrementing video views");
      const res = await axios.post("/api/Inc-video-views", {
        videoId: videoId,
        id: session?.user?.id,
      });

      if (res.status === 200) {
        console.log("Video views incremented");
        setViews(res.data.views);
      }
    } catch (error) {
      console.error("Error incrementing video views:", error);
    }
  };

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
  }, []);

  const handleKeyPress = useCallback(
    (event) => {
      if (document.activeElement?.tagName === "INPUT" || !playerRef.current)
        return;

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "f":
          event.preventDefault();
          toggleFullScreen();
          break;
        case "m":
          event.preventDefault();
          setVolume((prev) => (prev === 0 ? 1 : 0));
          break;
        case "arrowleft":
          event.preventDefault();
          if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(playerRef.current.getCurrentTime() - 5);
          }
          break;
        case "arrowright":
          event.preventDefault();
          if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(playerRef.current.getCurrentTime() + 5);
          }
          break;
        case "arrowup":
          event.preventDefault();
          handleVolumeChange(Math.min(volume + 0.1, 1));
          break;
        case "arrowdown":
          event.preventDefault();
          handleVolumeChange(Math.max(volume - 0.1, 0));
          break;
      }
    },
    [handleVolumeChange, volume]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    return hh ? `${hh}:${mm.toString().padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
  };

  const handleProgress = useCallback(
    (state) => {
      setPlayed(state.playedSeconds);
      setLoaded(state.loadedSeconds);
      localStorage.setItem(
        `video-${videoId}-last-viewed-time`,
        state.playedSeconds.toString()
      );

      const currentTime = Math.floor(state.playedSeconds);

      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }

      if (Math.abs(currentTime - debouncedProgress) >= 5) {
        progressTimeoutRef.current = setTimeout(() => {
          console.log("Updating watched duration", currentTime);
          const fromData = new FormData();
          fromData.append("videoId", videoId);
          fromData.append("userid", session?.user?.id);
          fromData.append("duration", state.playedSeconds.toString());

          axios
            .put("/api/update-video-watched-duration", fromData)
            .then(() => {
              setDebouncedProgress(currentTime);
              console.log("Watched duration updated");
            })
            .catch((err) =>
              console.error("Error updating watched duration", err)
            );
        }, 1000);
      }
    },
    [session?.user?.id, videoId, debouncedProgress]
  );

  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  };

  const handleQualityChange = (quality) => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    setCurrentTime(currentTime);
    setSelectedQuality(quality);
  };

  useEffect(() => {
    if (currentTime > 0) {
      playerRef.current?.seekTo(currentTime);
    }
  }, [currentTime]);

  const handleLike = async () => {
    const fromData = new FormData();
    fromData.append("videoId", videoId);
    fromData.append("userid", session?.user?.id || "");
    const response = await axios.post("/api/likeVideo", fromData);
    if (response.data.status === 200) {
      setLikes(response.data.likeCount);
    }
  };

  const handleUnlike = async () => {
    try {
      const formData = new FormData();
      formData.append("videoId", videoId);
      formData.append("userid", session?.user?.id);
      const res = await axios.delete("/api/remove-liked-video", {
        data: formData,
      });

      if (res.status === 200) {
        setLikes(res.data.likeCount);
      }
    } catch (error) {
      console.error("Error removing liked video:", error);
    }
  };

  const getVideoUrl = () => {
    if (selectedQuality === "auto") {
      return `http://localhost:8000/api/v1/video/get-video/${videoId}/master.m3u8`;
    }
    return `http://localhost:8000/api/v1/video/get-video/${videoId}/${selectedQuality}.m3u8`;
  };

  if (isLoading) {
    return <VideoSkeleton />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full flex flex-col lg:flex-row items-start justify-center gap-4 p-4">
      <div
        ref={containerRef}
        className="w-full lg:w-2/3 h-full max-h-[calc(100vh-80px)] overflow-y-auto"
      >
        {/* Video Container */}

        <div className="relative aspect-video bg-black">
          <ReactPlayer
            ref={playerRef}
            url={getVideoUrl()}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={volume}
            playbackRate={playbackRate}
            onProgress={handleProgress}
            onDuration={setDuration}
            pip={pip}
            controls={false}
            style={{ position: "absolute", top: 0, left: 0 }}
            playsinline={true}
            playIcon={<Play className="h-5 w-5" />}
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload",
                  playsInline: true,
                  webkitplaysinline: "true",
                },
                hlsOptions: {
                  autoStartLoad: true,
                  capLevelToPlayerSize: selectedQuality === "auto",
                  startLevel: selectedQuality === "auto" ? -1 : undefined,
                  maxBufferLength: 10,
                },
              },
            }}
          />

          {/* Mobile-friendly controls */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity touch-none ">
            {/* Progress bar */}

            {/* Controls */}
            <div className="p-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <span className="text-white text-sm">
                  {formatTime(played)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Quality selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {selectedQuality}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {qualityOptions.map((quality) => (
                      <DropdownMenuItem
                        key={quality}
                        onClick={() => handleQualityChange(quality)}
                      >
                        {quality}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Playback speed selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      {playbackRate}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <DropdownMenuItem
                        key={rate}
                        onClick={() => setPlaybackRate(rate)}
                      >
                        {rate}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleFullScreen}
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="px-4 w-full">
              <div className="relative h-1 bg-white/30 touch-none">
                <div
                  className="absolute h-full bg-white/50"
                  style={{ width: `${(loaded / duration) * 100}%` }}
                />
                <div
                  className="absolute h-full bg-red-500"
                  style={{ width: `${(played / duration) * 100}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={played}
                  onChange={(e) => {
                    const newTime = Number.parseFloat(e.target.value);
                    playerRef.current?.seekTo(newTime);
                    setPlayed(newTime);
                  }}
                  className="absolute w-full h-6 -top-2 opacity-0 cursor-pointer touch-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video Info - Mobile Friendly */}
        <div className="px-4 py-3 space-y-4">
          <div className="space-y-2">
            <h1 className="text-lg font-semibold line-clamp-2">{title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{(views || 0).toLocaleString()} views</span>
              <span>•</span>
              <span>{(likes || 0).toLocaleString()} likes</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Link href={`/channel/${username}`}>
                <Image
                  src={channelImage || "/placeholder.svg"}
                  alt={channelName || "Channel Icon"}
                  width={40}
                  height={40}
                  className="rounded-full w-10 h-10 object-cover flex-shrink-0"
                />
              </Link>
              <div className="min-w-0">
                <h2 className="font-medium truncate">{channelName}</h2>
                <p className="text-sm text-gray-500 truncate">
                  {(subscribers || 0).toLocaleString()} subscribers
                </p>
              </div>
            </div>
            {session?.user?.id ? (
              <Button variant="secondary" className="rounded-full">
                Subscribe
              </Button>
            ) : null}
          </div>

          <div className="flex gap-2 flex-wrap">
            {session?.user?.id ? (
              <div className="flex rounded-full overflow-hidden">
                <Button
                  variant="secondary"
                  className="rounded-r-none px-4"
                  onClick={handleLike}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {(likes || 0).toLocaleString()}
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-l-none"
                  onClick={handleUnlike}
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
            <Button variant="secondary" className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {description && (
            <div
              className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm whitespace-pre-wrap"
              style={{ wordBreak: "break-word" }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="w-full lg:w-1/3 h-full max-h-[calc(100vh-64px)] overflow-hidden">
        <ChatInterface videoId={videoId} />
      </div>
    </div>
  );
}
