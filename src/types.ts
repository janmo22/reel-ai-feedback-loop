
// Importamos FileWithPath de react-dropzone
export interface FileWithPath extends File {
  path?: string;
}

export interface VideoUploadResponse {
  status: "success" | "error" | "processing";
  videoId?: string;
  message?: string;
}

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

// Updated to ensure it extends Video properly
export interface VideoWithFeedback extends Video {
  feedback: FeedbackData[] | null;
}

export interface Feedback {
  id: string;
  overall_score: number;
  created_at: string;
}

export interface AIFeedbackResponse {
  id: string;
  video_id: string;
  overall_score: number;
  feedback_data: any;
  created_at: string;
  
  // Add properties used in ResultsFeedback and ResultsPage components
  contentTitle?: string;
  contentSubtitle?: string;
  generalStudy: string;
  contentType: string;
  overallEvaluation: {
    score: number;
    suggestions: string[];
  };
  structure?: {
    hook?: {
      general: string;
      spoken: string;
      visual: string;
      strengths: string;
      weaknesses: string;
      score: number;
      auditory?: string;
      clarity?: string;
      feel?: string;
      invitation?: string;
      patternBreak?: string;
    };
    buildUp?: string;
    value?: {
      comment: string;
      score: number;
      function: string;
    };
    cta?: string;
  };
  seo: {
    keywordAnalysis: string;
    clarity: string;
    suggestedText: string;
    suggestedCopy: string;
  };
  nativeCodes: string;
  engagementPotential: {
    interaction: string;
    watchTime: string;
  };
}
