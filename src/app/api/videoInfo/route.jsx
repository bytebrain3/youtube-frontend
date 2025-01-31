import { NextApiRequest, NextApiResponse } from 'next';
import Video from '../../../models/models.video';

export default async function handler(req , res) {
  if (req.method === 'GET') {
    try {
      const videos = await Video.findById({_id : req.body.videoId}) ;
      return res.status(200).json({ success: true, data: videos });
    } catch (error) {
      console.error('Error fetching videos:', error);
      return res.status(500).json({ success: false, message: 'Error fetching videos' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

