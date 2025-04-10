export interface User {
  id: string;
  email: string | null;
  user_metadata: {
    [key: string]: any;
  };
}

export interface AIFeedbackResponse {
  generalStudy: string;
  contentType: string;
  overallEvaluation: {
    score: number;
    suggestions: string[];
  };
}

export interface Video {
  id: string;
  created_at: string | null;
  title: string;
  status: 'processing' | 'completed' | 'failed';
  url: string | null;
  user_id: string;
  thumbnail_url: string | null;
  is_favorite: boolean;
  updated_at: string | null;
}

export interface Feedback {
  id: string;
  overall_score: number;
  created_at: string;
}
