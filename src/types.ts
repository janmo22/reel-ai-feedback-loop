
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
      targetAudienceClarityComment?: string;
      valuePropositionClarityComment?: string;
      creatorConsistencyComment?: string;
      recommendations?: string;
    };
    contentTypeStrategy?: {
      classification?: string;
      trendAdaptationCritique?: string;
      seriesClarityAndHookComment?: string;
      recommendations?: string;
    };
    seoAndDiscoverability?: {
      keywordIdentificationComment?: string;
      thematicClarityComment?: string;
      onScreenTextSEOAanalysis?: string;
      copySEOAnalysis?: string;
      hashtagsSEOAnalysis?: string;
      coverThumbnailPotentialComment?: string;
      advancedDiscoveryAndIndexingComment?: string;
      searchBarPotentialComment?: string;
      suggestedOptimizedCopy?: string;
      suggestedOptimizedOnScreenText?: string;
      recommendations?: string;
      advancedDiscoveryFeaturesComment?: string;
      trucoFlow?: string;
    };
    engagementOptimization?: {
      watchTimePotentialComment?: string;
      interactionHierarchyComment?: string;
      viralityFactorsComment?: string;
      recommendations?: string;
    };
    platformNativeElements?: {
      identifiedElements?: string;
      integrationEffectivenessComment?: string;
      recommendations?: string;
    };
    videoStructureAndPacing?: {
      hook?: {
        overallEffectivenessScore?: number;
        attentionGrabbingComment?: string;
        clarityAndSimplicityComment?: string;
        viewerBenefitCommunicationComment?: string;
        visualHookAnalysis?: string;
        auditoryHookAnalysis?: string;
        spokenHookAnalysis?: string;
        authenticityFeelComment?: string;
        patternDisruptionComment?: string;
        strengths?: string;
        weaknesses?: string;
        recommendations?: string;
      };
      buildUpAndPacingComment?: string;
      buildUpAndPacingRecommendations?: string;
      valueDelivery?: {
        qualityScore?: number;
        mainFunction?: string;
        comment?: string;
        recommendations?: string;
      };
      ctaAndEnding?: {
        comment?: string;
        recommendations?: string;
      };
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
    trucoFlow?: string;
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
