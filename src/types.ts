
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  feedback: Feedback[];
}

export interface Feedback {
  id: string;
  overall_score: number;
  created_at: string;
}

export interface VideoUploadFormData {
  title: string;
  description: string;
  mainMessage: string;
  missions: string[];
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export interface AnalysisResponse {
  id: string;
  feedback: string;
  score: number;
  suggestions: string;
  tags: string[];
  created_at: string;
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  error?: string;
}

export interface SupabaseVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  user_id: string;
  created_at: string;
  status: string;
  is_favorite: boolean;
  updated_at: string;
}

// Add the missing types that were causing errors
export interface VideoUploadResponse {
  success: boolean;
  videoId?: string;
  error?: string;
}

export interface AIFeedbackResponse {
  id: string;
  feedback: string;
  score: number;
  suggestions: string;
  tags: string[];
  created_at: string;
}

// Update the VideoWithFeedback interface to match Video interface properly
export interface VideoWithFeedback extends Omit<Video, 'feedback'> {
  feedback?: Feedback[];
}
