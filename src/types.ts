import { FileWithPath } from "react-dropzone";

export interface VideoUploadResponse {
  status: "success" | "error" | "processing";
  videoId?: string;
  message?: string;
}

// Ensure we add is_favorite to the Video interface
export interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_favorite: boolean;
  feedback?: {
    id: string;
    overall_score: number;
    created_at: string;
  }[];
}

export interface AuthProvider {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  provider: AuthProvider;
}

export interface UserSession {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface FeedbackData {
  id: string;
  video_id: string;
  overall_score: number;
  feedback_data: any;
  webhook_response: any;
  created_at: string;
  processing_completed_at: string | null;
}

export interface VideoWithFeedback extends Video {
  feedback: FeedbackData | null;
}
