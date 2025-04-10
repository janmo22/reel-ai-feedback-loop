
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

export interface VideoUploadResponse {
  success?: boolean;
  videoId?: string;
  error?: string;
  status?: string;
  message?: string;
}

export interface AIFeedbackResponse {
  id: string;
  created_at: string;
  // Legacy properties for backward compatibility
  feedback?: string;
  score?: number;
  suggestions?: string;
  tags?: string[];
  generalStudy?: string;
  contentType?: string;
  contentTitle?: string;
  contentSubtitle?: string;
  
  // New enhanced structure
  feedback_data?: {
    userId?: string;
    videoId?: string;
    executiveSummary?: string;
    finalEvaluation?: {
      overallScore: number;
      finalRecommendations: string[];
    };
    strategicAlignment?: {
      recommendations: string;
      creatorConsistencyComment: string;
      targetAudienceClarityComment: string;
      valuePropositionClarityComment: string;
    };
    contentTypeStrategy?: {
      classification: string;
      recommendations: string;
      trendAdaptationCritique?: string;
      seriesClarityAndHookComment?: string;
    };
    seoAndDiscoverability?: {
      copySEOAnalysis: string;
      recommendations: string;
      hashtagsSEOAnalysis: string;
      suggestedOptimizedCopy: string;
      thematicClarityComment: string;
      onScreenTextSEOAanalysis: string;
      searchBarPotentialComment: string;
      keywordIdentificationComment: string;
      coverThumbnailPotentialComment: string;
      suggestedOptimizedOnScreenText: string;
      advancedDiscoveryFeaturesComment: string;
    };
    engagementOptimization?: {
      recommendations: string;
      viralityFactorsComment: string;
      watchTimePotentialComment: string;
      interactionHierarchyComment: string;
    };
    platformNativeElements?: {
      recommendations: string;
      identifiedElements: string;
      integrationEffectivenessComment: string;
    };
    videoStructureAndPacing?: {
      hook?: {
        strengths: string;
        weaknesses: string;
        recommendations: string;
        spokenHookAnalysis: string;
        visualHookAnalysis: string;
        auditoryHookAnalysis: string;
        authenticityFeelComment: string;
        attentionGrabbingComment: string;
        patternDisruptionComment: string;
        overallEffectivenessScore: number;
        clarityAndSimplicityComment: string;
        viewerBenefitCommunicationComment: string;
      };
      ctaAndEnding?: {
        comment: string;
        recommendations: string;
      };
      valueDelivery?: {
        comment: string;
        mainFunction: string;
        qualityScore: number;
        recommendations: string;
      };
      buildUpAndPacingComment?: string;
      buildUpAndPacingRecommendations?: string;
    };
  };
  
  // Computed properties for compatibility with existing components
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
      auditory: string;
      clarity: string;
      feel: string;
      invitation: string;
      patternBreak: string;
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
    suggestedText?: string;
    suggestedCopy?: string;
  };
  nativeCodes: string;
  engagementPotential: {
    interaction: string;
    watchTime: string;
  };
}

// Update the VideoWithFeedback interface to match Video interface properly
export interface VideoWithFeedback extends Omit<Video, 'feedback'> {
  feedback?: Feedback[];
}
