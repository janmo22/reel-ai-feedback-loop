
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
  feedback_received?: boolean;
  missions?: string[];
  main_message?: string;
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
  message?: string;
}

// Define the AIFeedbackResponse interface to match the webhook response structure
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
