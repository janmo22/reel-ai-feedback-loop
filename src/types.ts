
// Video and feedback types for the application
export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

export interface Feedback {
  id: string;
  video_id: string;
  overall_score: number;
  feedback_data: any;
  created_at: string | null;
}

export interface VideoUploadResponse {
  status: string;
  videoId: string;
}
