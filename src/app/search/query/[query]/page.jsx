"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import VideoCard from "@/components/videoCard";
import { VideoSkeleton } from "@/components/skeleton/VideoSkeleton";

const SearchPage = () => {
  const { query } = useParams();
  const decodedQuery = decodeURIComponent(query);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        const response = await axios.get(`/api/search-video/query/${decodedQuery}?query=${encodeURIComponent(decodedQuery)}`);
        setVideos(response.data.videos || []);

      } catch (error) {
        console.error('Search error:', error);
        setError(error.response?.data?.error || 'Failed to fetch search results');
      } finally {
        setLoading(false);
      }
    };
    
    if (decodedQuery) {
      fetchVideos();
    }
  }, [decodedQuery]);

  return (
    <div className="w-full overflow-y-auto h-[calc(100vh-80px)] p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Search results for: {decodedQuery}</h1>

        {error && (
          <div className="text-red-500 mb-4">Error: {error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <VideoSkeleton key={i} />
            ))
          ) : videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard
                key={video.videoId}
                videoId={video.videoId}
                thumbnail={video.thumbnailUrl}
                title={video.title}
                channel={video.channel_name}
                channelImage={video.channel_icon}
                views={video.views}
                uploadDate={video.createdAt}
                duration={video.duration}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground">
              No videos found for "{decodedQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
