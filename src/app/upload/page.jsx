"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { X, Info } from "lucide-react"
import Image from "next/image"
import ReactPlayer from "react-player"
import { useSocket } from "@/lib/socket"
import axiosInstance from "@/lib/axiosinstance"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"


export default function UploadVideo() {
  const { data: session } = useSession()
  const [title, setTitle] = useState("")
  const [tags, setTags] = useState([])
  const [description, setDescription] = useState("")
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoPreview, setVideoPreview] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [isUploadDone, setIsUploadDone] = useState(false)
  const [videoID, setVideoID] = useState(null)
  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [thumbnailError, setThumbnailError] = useState(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)

  const socket = useSocket()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!socket?.connected) {
      console.log("Socket not connected")
    }
  }, [socket])

  const onVideoDrop = useCallback(
    async (acceptedFiles) => {
      try {
        if (!socket?.connected || !socket?.id) {
          throw new Error("Socket connection not established")
        }

        const file = acceptedFiles[0]
        if (!file.type.startsWith("video/")) {
          throw new Error("Invalid file type. Please upload a video file.")
        }

        setVideoFile(file)
        setVideoPreview(URL.createObjectURL(file))

        const formData = new FormData()
        formData.append("video", file)
        formData.append("socketId", socket.id)

        socket.on("progress", (data) => {
          setUploadProgress(data.percent)
        })

        const res = await axiosInstance.post("/api/v1/video/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (!res.data.success) throw new Error(res.data.message)

        setIsUploadDone(true)
        setVideoID(res.data.id)
        setVideoDuration(res.data.duration)
      } catch (error) {
        console.error("Error uploading file:", error)
        setUploadProgress(0)
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        })
      }
    },
    [socket, toast],
  )

  const onThumbnailDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0]
        setThumbnailFile(file)
        setThumbnailPreview(URL.createObjectURL(file))
        setThumbnailError(null)
        setIsThumbnailUploading(true)

        const formData = new FormData()
        formData.append("thumbnail", file)

        const response = await axiosInstance.post("/api/v1/image/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        if (!response.data.success) {
          throw new Error(response.data.message)
        }

        setThumbnailUrl(response.data.data)
        toast({
          description: "Thumbnail uploaded successfully",
        })
      } catch (error) {
        console.error("Thumbnail upload error:", error)
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
        setThumbnailError(errorMessage)
        setThumbnailFile(null)
        setThumbnailPreview(null)
        toast({
          variant: "destructive",
          title: "Thumbnail Upload Failed",
          description: errorMessage,
        })
      } finally {
        setIsThumbnailUploading(false)
      }
    },
    [toast],
  )

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    onDrop: onVideoDrop,
    accept: { "video/*": [] },
    multiple: false,
  })

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { "image/*": [] },
    multiple: false,
  })

  const handleTagChange = (e) => {
    const inputValue = e.target.value
    const tagsArray = inputValue ? inputValue.split(",").map((tag) => tag.trim()) : []
    setTags(tagsArray)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!title || !description || !videoFile || !thumbnailFile) return

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("tags", tags.join(","))
      formData.append("videoId", videoID || "")
      formData.append("thumbnail", thumbnailUrl || "")
      formData.append("userid", session?.user?.id || "")
      formData.append("duration", videoDuration.toString())

      const response = await axios.post("/api/uploadVideo", formData)

      if (response.status === 200) {
        toast({
          description: "Video uploaded successfully",
        })
        router.push("/")
      } else {
        throw new Error("Video upload failed")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    }
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto p-4 pb-20">
        <Card className="bg-background border-none shadow-none">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title" className="text-base font-semibold">
                      Title
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Add a title that describes your video"
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="tags" className="text-base font-semibold">
                      Tags
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="tags"
                    value={tags.join(", ")}
                    onChange={handleTagChange}
                    placeholder="Add tags separated by commas"
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description" className="text-base font-semibold">
                      Description
                    </Label>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers about your video"
                    className="mt-1 min-h-[150px]"
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnail" className="text-base font-semibold block mb-2">
                    Thumbnail
                  </Label>
                  <div
                    {...getThumbnailRootProps()}
                    className="mt-1 h-60 sm:h-80 flex items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                  >
                    <input {...getThumbnailInputProps()} />
                    {thumbnailPreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={thumbnailPreview || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setThumbnailFile(null)
                            setThumbnailPreview(null)
                          }}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        {isThumbnailUploading ? (
                          <p className="text-muted-foreground">Uploading thumbnail...</p>
                        ) : (
                          <>
                            <p className="text-muted-foreground">Upload thumbnail</p>
                            {thumbnailError && <p className="text-destructive text-sm mt-2">{thumbnailError}</p>}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {videoPreview ? (
                  <div className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ paddingTop: "56.25%" }}>
                    <ReactPlayer
                      url={videoPreview}
                      controls
                      width="100%"
                      height="100%"
                      className="absolute top-0 left-0"
                    />
                  </div>
                ) : (
                  <div
                    {...getVideoRootProps()}
                    className="relative w-full border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    style={{ paddingTop: "56.25%" }}
                  >
                    <input {...getVideoInputProps()} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-muted-foreground">Drop your video here or click to upload</p>
                    </div>
                  </div>
                )}

                {uploadProgress > 0 && !isUploadDone && <Progress value={uploadProgress} className="w-full" />}

                {isUploadDone && videoID && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      setVideoFile(null)
                      setVideoPreview(null)
                      setUploadProgress(0)
                      setIsUploadDone(false)
                      setVideoID(null)
                    }}
                  >
                    Cancel Upload
                  </Button>
                )}

                {videoFile && (
                  <div className="text-sm text-muted-foreground">
                    <p>Filename: {videoFile.name}</p>
                    <p>Size: {Math.round(videoFile.size / 1024 / 1024)}MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-6xl mx-auto flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || !videoFile || !thumbnailFile || !isUploadDone || !thumbnailUrl}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  )
}

