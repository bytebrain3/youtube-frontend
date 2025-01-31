import { useEffect, useState, useRef, useCallback } from "react"
import { Play, Pause, Volume2, Maximize, ThumbsUp, ThumbsDown, Share2, PictureInPicture, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import dynamic from "next/dynamic"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useParams } from "next/navigation"
import axios from "axios"
import { useSession } from "next-auth/react"

const ReactPlayer = dynamic(() => import("react-player"), {
  ssr: false,
})

export default function VideoPlayer() {
  const [isMounted, setIsMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [played, setPlayed] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [selectedQuality, setSelectedQuality] = useState("auto")
  const [title, setTitle] = useState("")
  const [channelName, setChannelName] = useState("")
  const [channelImage, setChannelImage] = useState("")
  const [subscribers, setSubscribers] = useState(0)
  const [likes, setLikes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [pip, setPip] = useState(false)

  const { data: session } = useSession()
  const params = useParams()
  const videoId = params.id

  const containerRef = useRef(null)
  const playerRef = useRef(null)

  const qualityOptions = ["auto", "360p", "420p", "720p", "1080p"]

  const getVideoUrl = useCallback(() => {
    if (selectedQuality === "auto") {
      return `${process.env.CLINT_URL}${process.env.PORT}/api/v1/video/get-video/${videoId}/master.m3u8`
    }
    return `${process.env.CLINT_URL}${process.env.PORT}/api/v1/video/get-video/${videoId}/${selectedQuality}.m3u8`
  }, [selectedQuality, videoId])

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  /*const handleVolumeChange = useCallback((newVolume: number[]) => {
    setVolume(newVolume[0])
  }, [])*/

  const handleProgress = useCallback((state) => {
    setPlayed(state.played);
  }, []);
  

  const handlePlaybackRateChange = useCallback((rate) => {
    setPlaybackRate(rate)
  }, [])

  const handleQualityChange = useCallback((quality) => {
    setSelectedQuality(quality)
  }, [])

  const handlePip = useCallback(() => {
    setPip((prev) => !prev)
  }, [])

  const handleLike = useCallback(async () => {
    if (!session?.user?.id) return
    const formData = new FormData()
    formData.append("videoId", videoId)
    formData.append("userid", session.user.id)
    const response = await axios.post("/api/likeVideo", formData)
    if (response.data.status === 200) {
      setLikes(response.data.likeCount)
    }
  }, [videoId, session?.user?.id])

  const handleUnlike = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const formData = new FormData()
      formData.append("videoId", videoId)
      formData.append("userid", session.user.id)
      const res = await axios.delete("/api/remove-liked-video", {
        data: formData,
      })

      if (res.status === 200) {
        setLikes(res.data.likeCount)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred")
      }
    }
  }, [videoId, session?.user?.id])

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const formatTime = useCallback((seconds) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, "0")
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`
    }
    return `${mm}:${ss}`
  }, [])

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`/api/videoInfo/${videoId}`)
        const data = response.data
        setTitle(data.title)
        setChannelName(data.channelName)
        setChannelImage(data.channelImage)
        setSubscribers(data.subscribers)
        setLikes(data.likes)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.message)
        } else {
          setError("An unexpected error occurred")
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (videoId) {
      fetchVideoData()
    }
  }, [videoId])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative aspect-video bg-black rounded-lg overflow-hidden group">
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

        {/* Video Controls - Updated for mobile */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-4 transition-opacity duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <Slider
            value={[played * 100]}
            max={100}
            step={0.1}
            className="w-full mb-2 sm:mb-4"
            onValueChange={(value) => {
              if (playerRef.current) {
                playerRef.current.seekTo(value[0] / 100)
              }
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button onClick={handlePlayPause} variant="ghost" size="icon" className="text-white">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <div className="hidden sm:flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-white" />
                <Slider
                  value={[volume * 100]}
                  onValueChange={(value) => setVolume(value[0] / 100)}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>
              <span className="text-white text-sm">
                {formatTime(played * duration)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handlePip} variant="ghost" size="icon" className="text-white">
                <PictureInPicture className="h-6 w-6" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Settings className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => handlePlaybackRateChange(0.5)}>0.5x</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handlePlaybackRateChange(1)}>1x</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handlePlaybackRateChange(1.5)}>1.5x</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handlePlaybackRateChange(2)}>2x</DropdownMenuItem>
                  <DropdownMenuItem>
                    <select
                      value={selectedQuality}
                      onChange={(e) => handleQualityChange(e.target.value)}
                      className="bg-transparent"
                    >
                      {qualityOptions.map((quality) => (
                        <option key={quality} value={quality}>
                          {quality}
                        </option>
                      ))}
                    </select>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={toggleFullScreen} variant="ghost" size="icon" className="text-white">
                <Maximize className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info - Updated for mobile */}
      <div className="space-y-4 px-2 sm:px-0">
        <h1 className="text-lg sm:text-xl font-semibold line-clamp-2">{title}</h1>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Image
                src={channelImage || "/placeholder.svg"}
                alt={channelName}
                width={40}
                height={40}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-medium text-sm sm:text-base">{channelName}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {subscribers.toLocaleString()} subscribers
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="sm:hidden">
              Subscribe
            </Button>
            <Button variant="secondary" className="hidden sm:inline-flex">
              Subscribe
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <div className="flex rounded-full overflow-hidden bg-secondary">
              <Button variant="secondary" size="sm" className="rounded-l-full" onClick={handleLike}>
                <ThumbsUp className="w-4 h-4 mr-2" />
                {likes}
              </Button>
              <Button variant="secondary" size="sm" className="rounded-r-full" onClick={handleUnlike}>
                <ThumbsDown className="w-4 h-4 mr-2" />
              </Button>
            </div>
            <Button variant="secondary" size="sm" className="rounded-full whitespace-nowrap">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

