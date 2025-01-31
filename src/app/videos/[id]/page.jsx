"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  Play,
  Pause,
  ListFilterIcon as ListFilterPlus,
  Volume2,
  Gauge,
  Maximize,
  ThumbsUp,
  Share2,
  PictureInPicture,
  ThumbsDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { VideoSkeleton } from "@/components/skeleton/VideoSkeleton"
import Image from "next/image"
import dynamic from "next/dynamic"
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false })
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import axios from "axios"

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const qualityOptions = ["auto", "360p", "420p", "720p", "1080p"]
  const [selectedQuality, setSelectedQuality] = useState("auto")
  const [currentTime, setCurrentTime] = useState(0)
  const [title, setTitle] = useState("")
  const [channelName, setChannelName] = useState("")
  const [channelImage, setChannelImage] = useState("")
  const [Subscribers, setSubscribers] = useState(0)
  const [likes, setLikes] = useState(0)

  const [debouncedProgress, setDebouncedProgress] = useState(0)
  const progressTimeoutRef = useRef()
  const [isLoading, setIsLoading] = useState(true)
  //const [error, setError] = useState("")
  //const [isInitializing, setIsInitializing] = useState(true)

  const { data: session } = useSession()
  const [volume, setVolume] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("volume")) || 1
    }
    return 1
  })

  const [pip, setPip] = useState(false)

  const params = useParams()
  const videoId = params.id

  const containerRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("volume", volume.toString())
    }
  }, [volume])

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`/api/videoInfo/${videoId}`)
        const video = response.data.data[0]
        if (!video) throw new Error("Video not found")

        const watchedDuration = Number.parseFloat(response.data.video_watch_duration || "0")
        setCurrentTime(watchedDuration)
        setPlayed(watchedDuration)

        setTitle(video.title)
        setChannelName(video.channel_name)
        setChannelImage(video.channel_icon)
        setSubscribers(video.subscribers)
        setLikes(video.likes)

        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.seekTo(watchedDuration)
            setIsInitializing(false)
            setIsPlaying(true)
          }
        }, 100)
      } catch (err) {
        setError("Failed to load video data")
        console.error(err)
        setIsInitializing(false)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchVideoViews = async () => {
      try {
        console.log("Incrementing video views")
        const res = await axios.post("/api/Inc-video-views", {
          videoId: videoId,
          id: session?.user?.id,
        })

        if (res.status === 200) {
          console.log("Video views incremented")
          const storedTime = localStorage.getItem(`video-${videoId}-last-viewed-time`)
          if (storedTime && playerRef.current) {
            playerRef.current.seekTo(Number.parseInt(storedTime, 10))
          }
        }
      } catch (error) {
        console.error("Error incrementing video views:", error)
      }
    }

    if (videoId) {
      fetchVideoData()
      setTimeout(() => {
        fetchVideoViews()
      }, 3000)
    }
  }, [videoId, session?.user?.id])

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume)
  }, [])

  const handleKeyPress = useCallback(
    (event) => {
      if (document.activeElement?.tagName === "INPUT" || !playerRef.current) return

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault()
          setIsPlaying((prev) => !prev)
          break
        case "f":
          event.preventDefault()
          toggleFullScreen()
          break
        case "m":
          event.preventDefault()
          setVolume((prev) => (prev === 0 ? 1 : 0))
          break
        case "arrowleft":
          event.preventDefault()
          if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(playerRef.current.getCurrentTime() - 5)
          }
          break
        case "arrowright":
          event.preventDefault()
          if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(playerRef.current.getCurrentTime() + 5)
          }
          break
        case "arrowup":
          event.preventDefault()
          handleVolumeChange(Math.min(volume + 0.1, 1))
          break
        case "arrowdown":
          event.preventDefault()
          handleVolumeChange(Math.max(volume - 0.1, 0))
          break
      }
    },
    [handleVolumeChange, volume],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [handleKeyPress])

  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, "0")
    return hh ? `${hh}:${mm.toString().padStart(2, "0")}:${ss}` : `${mm}:${ss}`
  }

  const handleProgress = useCallback(
    (state) => {
      setPlayed(state.playedSeconds)
      localStorage.setItem(`video-${videoId}-last-viewed-time`, state.playedSeconds.toString())

      const currentTime = Math.floor(state.playedSeconds)

      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current)
      }

      if (Math.abs(currentTime - debouncedProgress) >= 5) {
        progressTimeoutRef.current = setTimeout(() => {
          console.log("Updating watched duration", currentTime)
          const fromData = new FormData()
          fromData.append("videoId", videoId)
          fromData.append("userid", session?.user?.id)
          fromData.append("duration", state.playedSeconds.toString())

          axios
            .put("/api/update-video-watched-duration", fromData)
            .then(() => {
              setDebouncedProgress(currentTime)
              console.log("Watched duration updated")
            })
            .catch((err) => console.error("Error updating watched duration", err))
        }, 1000)
      }
    },
    [session?.user?.id, videoId, debouncedProgress],
  )

  const toggleFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current?.requestFullscreen()
    }
  }

  const handleQualityChange = (quality) => {
    const currentTime = playerRef.current?.getCurrentTime() || 0
    setCurrentTime(currentTime)
    setSelectedQuality(quality)
  }

  useEffect(() => {
    if (currentTime > 0) {
      playerRef.current?.seekTo(currentTime)
    }
  }, [currentTime]) // Removed unnecessary dependency: selectedQuality

  const handelLike = async () => {
    const fromData = new FormData()
    fromData.append("videoId", videoId)
    fromData.append("userid", session?.user?.id || "")
    const response = await axios.post("/api/likeVideo", fromData)
    if (response.data.status === 200) {
      setLikes(response.data.likeCount)
    }
  }

  const handelUnLike = async () => {
    try {
      const formData = new FormData()
      formData.append("videoId", videoId)
      formData.append("userid", session?.user?.id)
      const res = await axios.delete("/api/remove-liked-video", {
        data: formData,
      })

      if (res.status === 200) {
        setLikes(res.data.likeCount)
      }
    } catch (error) {
      console.error("Error removing liked video:", error)
    }
  }

  const getVideoUrl = () => {
    if (selectedQuality === "auto") {
      return `http://localhost:8000/api/v1/video/get-video/${videoId}/master.m3u8`
    }
    return `http://localhost:8000/api/v1/video/get-video/${videoId}/${selectedQuality}.m3u8`
  }

  if (isLoading) {
    return <VideoSkeleton />
  }

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto p-4 relative">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
        {!isLoading && (
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
            style={{ position: "absolute", top: 0, left: 0 }}
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload",
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
        )}

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          <div className="space-y-4">
            {/* Progress bar */}
            <Slider
              value={[played]}
              max={duration}
              step={0.1}
              className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0"
              onValueChange={([value]) => playerRef.current?.seekTo(value)}
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <Slider
                    value={[volume * 100]}
                    max={100}
                    className="w-24 [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0"
                    onValueChange={([value]) => setVolume(value / 100)}
                  />
                </div>

                <div className="text-white text-sm">
                  {formatTime(played)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setPip(!pip)}
                >
                  <PictureInPicture />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Gauge />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {[0.5, 1, 1.5, 2].map((rate) => (
                      <DropdownMenuItem key={rate} onClick={() => setPlaybackRate(rate)}>
                        {rate}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <ListFilterPlus />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {qualityOptions.map((q, i) => (
                      <DropdownMenuItem key={i} onClick={() => handleQualityChange(q)}>
                        {q === selectedQuality ? `✓ ${q}` : q}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" className="text-white" onClick={toggleFullScreen}>
                  <Maximize />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-4 space-y-4">
        <h1 className="text-xl font-semibold">{title}</h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={channelImage || "/placeholder.svg"}
              alt="Channel avatar"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-medium">{channelName || "unknown"}</h2>
              <p className="text-sm text-gray-500">{Subscribers || "unknown"}</p>
            </div>
            <Button variant="secondary" className="ml-4 rounded-lg">
              Subscribe
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
            <div>
              <Button variant="secondary" size="sm" className="rounded-l-full" onClick={handelLike}>
                <ThumbsUp className="w-4 h-4 mr-2" />
                {likes}
              </Button>
              <span className="p-[0.5]" />
              <Button variant="secondary" size="sm" className="rounded-r-full" onClick={handelUnLike}>
                <ThumbsDown className="w-4 h-4 mr-2" />
              </Button>
            </div>
            <Button variant="secondary" size="sm" className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

