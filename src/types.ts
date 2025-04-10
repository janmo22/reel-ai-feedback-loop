
export interface User {
  id: string;
  email: string | null;
  user_metadata: {
    [key: string]: any;
  };
}

export interface AIFeedbackResponse {
  videoId?: string;
  userId?: string;
  contentTitle?: string;
  contentSubtitle?: string;
  generalStudy: string;
  contentType: string;
  engagementPotential: {
    interaction: string;
    watchTime: string;
  };
  nativeCodes: string;
  overallEvaluation: {
    score: number;
    suggestions: string[];
  };
  seo: {
    keywordAnalysis: string;
    suggestedCopy: string;
    suggestedText: string;
    clarity: string;
  };
  structure?: {
    hook?: {
      general: string;
      spoken: string;
      auditory: string;
      visual: string;
      clarity: string;
      feel: string;
      invitation: string;
      patternBreak: string;
      strengths: string;
      weaknesses: string;
      score: number;
    };
    buildUp?: string;
    value?: {
      comment: string;
      score: number;
      function: string;
    };
    cta?: string;
  };
}

export interface Video {
  id: string;
  created_at: string | null;
  title: string;
  description?: string | null;
  status: 'processing' | 'completed' | 'failed';
  url?: string | null;
  video_url?: string;
  user_id: string;
  thumbnail_url: string | null;
  is_favorite: boolean;
  updated_at: string | null;
}

export interface Feedback {
  id: string;
  video_id?: string;
  overall_score: number;
  feedback_data?: any;
  created_at: string;
}

export interface VideoUploadResponse {
  status: string;
  videoId: string;
  message?: string;
}
