
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Video, AIFeedbackResponse } from '@/types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useVideoResults = (videoId?: string) => {
  const [searchParams] = useSearchParams();
  const queryVideoId = videoId || searchParams.get('videoId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [video, setVideo] = useState<Video | null>(null);
  const [feedback, setFeedback] = useState<AIFeedbackResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchVideo = useCallback(async () => {
    console.log(`Fetching video data for ID: ${queryVideoId}`);
    
    if (!queryVideoId) {
      console.log("No video ID provided");
      setLoading(false);
      return;
    }
    
    if (!user) {
      console.log("No authenticated user");
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching video from database...");
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('id', queryVideoId)
        .eq('user_id', user.id)
        .single();
      
      if (videoError) {
        console.error("Video fetch error:", videoError);
        if (videoError.code === 'PGRST116') {
          setUnauthorized(true);
          throw new Error('No tienes permiso para acceder a este video o no existe');
        }
        throw new Error(videoError.message);
      }
      
      if (!videoData) {
        console.log("No video data found");
        setUnauthorized(true);
        throw new Error('Video no encontrado');
      }
      
      console.log("Video data found:", videoData);
      
      console.log("Fetching feedback data...");
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('video_id', queryVideoId)
        .order('created_at', { ascending: false });
      
      if (feedbackError) {
        console.error("Feedback fetch error:", feedbackError);
        throw new Error(feedbackError.message);
      }
      
      console.log(`Found ${feedbackData?.length || 0} feedback records`);
      
      const isFavorite = 'is_favorite' in videoData ? !!videoData.is_favorite : false;
      
      const finalVideo: Video = {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description || '',
        status: videoData.status,
        created_at: videoData.created_at,
        video_url: videoData.video_url,
        user_id: videoData.user_id,
        thumbnail_url: videoData.thumbnail_url || '',
        is_favorite: isFavorite,
        updated_at: videoData.updated_at || videoData.created_at,
        feedback: []
      };
      
      setVideo(finalVideo);

      if (feedbackData && feedbackData.length > 0) {
        console.log("Processing feedback data...");
        const processedFeedback: AIFeedbackResponse[] = [];
        
        for (const item of feedbackData) {
          try {
            console.log("Processing feedback item:", item.id);
            const feedbackJson = item.feedback_data as Record<string, any> || {};
            
            // Access the original data structure or the flattened structure
            const originalData = feedbackJson._original || feedbackJson;
            
            const aiResponse: AIFeedbackResponse = {
              id: item.id,
              created_at: item.created_at,
              
              generalStudy: originalData.executiveSummary || feedbackJson.executiveSummary || "",
              contentType: originalData.contentTypeStrategy?.classification || feedbackJson.contentTypeStrategy_classification || "Análisis de contenido",
              contentTitle: videoData.title,
              contentSubtitle: "Análisis de rendimiento",
              
              feedback_data: {
                executiveSummary: originalData.executiveSummary || feedbackJson.executiveSummary || "",
                finalEvaluation: {
                  overallScore: originalData.finalEvaluation?.overallScore || feedbackJson.finalEvaluation_overallScore || item.overall_score || 0,
                  finalRecommendations: originalData.finalEvaluation?.finalRecommendations || feedbackJson.finalEvaluation_finalRecommendations || []
                },
                strategicAlignment: {
                  targetAudienceClarityComment: originalData.strategicAlignment?.targetAudienceClarityComment || feedbackJson.strategicAlignment_targetAudienceClarityComment || "",
                  valuePropositionClarityComment: originalData.strategicAlignment?.valuePropositionClarityComment || feedbackJson.strategicAlignment_valuePropositionClarityComment || "",
                  creatorConsistencyComment: originalData.strategicAlignment?.creatorConsistencyComment || feedbackJson.strategicAlignment_creatorConsistencyComment || "",
                  recommendations: originalData.strategicAlignment?.recommendations || feedbackJson.strategicAlignment_recommendations || ""
                },
                contentTypeStrategy: {
                  classification: originalData.contentTypeStrategy?.classification || feedbackJson.contentTypeStrategy_classification || "",
                  trendAdaptationCritique: originalData.contentTypeStrategy?.trendAdaptationCritique || feedbackJson.contentTypeStrategy_trendAdaptationCritique || "",
                  seriesClarityAndHookComment: originalData.contentTypeStrategy?.seriesClarityAndHookComment || feedbackJson.contentTypeStrategy_seriesClarityAndHookComment || "",
                  recommendations: originalData.contentTypeStrategy?.recommendations || feedbackJson.contentTypeStrategy_recommendations || ""
                },
                seoAndDiscoverability: {
                  keywordIdentificationComment: originalData.seoAndDiscoverability?.keywordIdentificationComment || feedbackJson.seoAndDiscoverability_keywordIdentificationComment || "",
                  thematicClarityComment: originalData.seoAndDiscoverability?.thematicClarityComment || feedbackJson.seoAndDiscoverability_thematicClarityComment || "",
                  hashtagsSEOAnalysis: originalData.seoAndDiscoverability?.hashtagsSEOAnalysis || feedbackJson.seoAndDiscoverability_hashtagsSEOAnalysis || "",
                  searchBarPotentialComment: originalData.seoAndDiscoverability?.searchBarPotentialComment || feedbackJson.seoAndDiscoverability_searchBarPotentialComment || "",
                  recommendations: originalData.seoAndDiscoverability?.recommendations || feedbackJson.seoAndDiscoverability_recommendations || "",
                  suggestedOptimizedCopy: originalData.seoAndDiscoverability?.suggestedOptimizedCopy || feedbackJson.seoAndDiscoverability_suggestedOptimizedCopy || "",
                  suggestedOptimizedOnScreenText: originalData.seoAndDiscoverability?.suggestedOptimizedOnScreenText || feedbackJson.seoAndDiscoverability_suggestedOptimizedOnScreenText || "",
                  onScreenTextSEOAanalysis: originalData.seoAndDiscoverability?.onScreenTextSEOAanalysis || feedbackJson.seoAndDiscoverability_onScreenTextSEOAanalysis || "",
                  coverThumbnailPotentialComment: originalData.seoAndDiscoverability?.coverThumbnailPotentialComment || feedbackJson.seoAndDiscoverability_coverThumbnailPotentialComment || "",
                  copySEOAnalysis: originalData.seoAndDiscoverability?.copySEOAnalysis || feedbackJson.seoAndDiscoverability_copySEOAnalysis || "",
                  advancedDiscoveryFeaturesComment: originalData.seoAndDiscoverability?.advancedDiscoveryFeaturesComment || feedbackJson.seoAndDiscoverability_advancedDiscoveryFeaturesComment || ""
                },
                engagementOptimization: {
                  interactionHierarchyComment: originalData.engagementOptimization?.interactionHierarchyComment || feedbackJson.engagementOptimization_interactionHierarchyComment || "",
                  watchTimePotentialComment: originalData.engagementOptimization?.watchTimePotentialComment || feedbackJson.engagementOptimization_watchTimePotentialComment || "",
                  viralityFactorsComment: originalData.engagementOptimization?.viralityFactorsComment || feedbackJson.engagementOptimization_viralityFactorsComment || "",
                  recommendations: originalData.engagementOptimization?.recommendations || feedbackJson.engagementOptimization_recommendations || ""
                },
                platformNativeElements: {
                  identifiedElements: originalData.platformNativeElements?.identifiedElements || feedbackJson.platformNativeElements_identifiedElements || "",
                  integrationEffectivenessComment: originalData.platformNativeElements?.integrationEffectivenessComment || feedbackJson.platformNativeElements_integrationEffectivenessComment || "",
                  recommendations: originalData.platformNativeElements?.recommendations || feedbackJson.platformNativeElements_recommendations || ""
                },
                videoStructureAndPacing: {
                  hook: {
                    attentionGrabbingComment: originalData.videoStructureAndPacing?.hook?.attentionGrabbingComment || feedbackJson.videoStructureAndPacing_hook_attentionGrabbingComment || "",
                    auditoryHookAnalysis: originalData.videoStructureAndPacing?.hook?.auditoryHookAnalysis || feedbackJson.videoStructureAndPacing_hook_auditoryHookAnalysis || "",
                    visualHookAnalysis: originalData.videoStructureAndPacing?.hook?.visualHookAnalysis || feedbackJson.videoStructureAndPacing_hook_visualHookAnalysis || "",
                    clarityAndSimplicityComment: originalData.videoStructureAndPacing?.hook?.clarityAndSimplicityComment || feedbackJson.videoStructureAndPacing_hook_clarityAndSimplicityComment || "",
                    authenticityFeelComment: originalData.videoStructureAndPacing?.hook?.authenticityFeelComment || feedbackJson.videoStructureAndPacing_hook_authenticityFeelComment || "",
                    viewerBenefitCommunicationComment: originalData.videoStructureAndPacing?.hook?.viewerBenefitCommunicationComment || feedbackJson.videoStructureAndPacing_hook_viewerBenefitCommunicationComment || "",
                    patternDisruptionComment: originalData.videoStructureAndPacing?.hook?.patternDisruptionComment || feedbackJson.videoStructureAndPacing_hook_patternDisruptionComment || "",
                    strengths: originalData.videoStructureAndPacing?.hook?.strengths || feedbackJson.videoStructureAndPacing_hook_strengths || "",
                    weaknesses: originalData.videoStructureAndPacing?.hook?.weaknesses || feedbackJson.videoStructureAndPacing_hook_weaknesses || "",
                    recommendations: originalData.videoStructureAndPacing?.hook?.recommendations || feedbackJson.videoStructureAndPacing_hook_recommendations || "",
                    spokenHookAnalysis: originalData.videoStructureAndPacing?.hook?.spokenHookAnalysis || feedbackJson.videoStructureAndPacing_hook_spokenHookAnalysis || "",
                    overallEffectivenessScore: originalData.videoStructureAndPacing?.hook?.overallEffectivenessScore || feedbackJson.videoStructureAndPacing_hook_overallEffectivenessScore || 0
                  },
                  buildUpAndPacingComment: originalData.videoStructureAndPacing?.buildUpAndPacingComment || feedbackJson.videoStructureAndPacing_buildUpAndPacingComment || "",
                  buildUpAndPacingRecommendations: originalData.videoStructureAndPacing?.buildUpAndPacingRecommendations || feedbackJson.videoStructureAndPacing_buildUpAndPacingRecommendations || "",
                  valueDelivery: {
                    comment: originalData.videoStructureAndPacing?.valueDelivery?.comment || feedbackJson.videoStructureAndPacing_valueDelivery_comment || "",
                    mainFunction: originalData.videoStructureAndPacing?.valueDelivery?.mainFunction || feedbackJson.videoStructureAndPacing_valueDelivery_mainFunction || "",
                    recommendations: originalData.videoStructureAndPacing?.valueDelivery?.recommendations || feedbackJson.videoStructureAndPacing_valueDelivery_recommendations || "",
                    qualityScore: originalData.videoStructureAndPacing?.valueDelivery?.qualityScore || feedbackJson.videoStructureAndPacing_valueDelivery_qualityScore || 0
                  },
                  ctaAndEnding: {
                    comment: originalData.videoStructureAndPacing?.ctaAndEnding?.comment || feedbackJson.videoStructureAndPacing_ctaAndEnding_comment || "",
                    recommendations: originalData.videoStructureAndPacing?.ctaAndEnding?.recommendations || feedbackJson.videoStructureAndPacing_ctaAndEnding_recommendations || ""
                  }
                }
              },
              
              overallEvaluation: {
                score: originalData.finalEvaluation?.overallScore || feedbackJson.finalEvaluation_overallScore || item.overall_score || 0,
                suggestions: originalData.finalEvaluation?.finalRecommendations || feedbackJson.finalEvaluation_finalRecommendations || []
              },
              
              structure: {
                hook: {
                  general: originalData.videoStructureAndPacing?.hook?.attentionGrabbingComment || feedbackJson.videoStructureAndPacing_hook_attentionGrabbingComment || "",
                  spoken: originalData.videoStructureAndPacing?.hook?.spokenHookAnalysis || feedbackJson.videoStructureAndPacing_hook_spokenHookAnalysis || "",
                  visual: originalData.videoStructureAndPacing?.hook?.visualHookAnalysis || feedbackJson.videoStructureAndPacing_hook_visualHookAnalysis || "",
                  auditory: originalData.videoStructureAndPacing?.hook?.auditoryHookAnalysis || feedbackJson.videoStructureAndPacing_hook_auditoryHookAnalysis || "",
                  clarity: originalData.videoStructureAndPacing?.hook?.clarityAndSimplicityComment || feedbackJson.videoStructureAndPacing_hook_clarityAndSimplicityComment || "",
                  feel: originalData.videoStructureAndPacing?.hook?.authenticityFeelComment || feedbackJson.videoStructureAndPacing_hook_authenticityFeelComment || "",
                  invitation: originalData.videoStructureAndPacing?.hook?.viewerBenefitCommunicationComment || feedbackJson.videoStructureAndPacing_hook_viewerBenefitCommunicationComment || "",
                  patternBreak: originalData.videoStructureAndPacing?.hook?.patternDisruptionComment || feedbackJson.videoStructureAndPacing_hook_patternDisruptionComment || "",
                  strengths: originalData.videoStructureAndPacing?.hook?.strengths || feedbackJson.videoStructureAndPacing_hook_strengths || "",
                  weaknesses: originalData.videoStructureAndPacing?.hook?.weaknesses || feedbackJson.videoStructureAndPacing_hook_weaknesses || "",
                  score: originalData.videoStructureAndPacing?.hook?.overallEffectivenessScore || feedbackJson.videoStructureAndPacing_hook_overallEffectivenessScore || 0
                },
                buildUp: originalData.videoStructureAndPacing?.buildUpAndPacingComment || feedbackJson.videoStructureAndPacing_buildUpAndPacingComment || "",
                value: {
                  comment: originalData.videoStructureAndPacing?.valueDelivery?.comment || feedbackJson.videoStructureAndPacing_valueDelivery_comment || "",
                  score: originalData.videoStructureAndPacing?.valueDelivery?.qualityScore || feedbackJson.videoStructureAndPacing_valueDelivery_qualityScore || 0,
                  function: originalData.videoStructureAndPacing?.valueDelivery?.mainFunction || feedbackJson.videoStructureAndPacing_valueDelivery_mainFunction || ""
                },
                cta: originalData.videoStructureAndPacing?.ctaAndEnding?.comment || feedbackJson.videoStructureAndPacing_ctaAndEnding_comment || ""
              },
              
              seo: {
                keywordAnalysis: originalData.seoAndDiscoverability?.keywordIdentificationComment || feedbackJson.seoAndDiscoverability_keywordIdentificationComment || "",
                clarity: originalData.seoAndDiscoverability?.thematicClarityComment || feedbackJson.seoAndDiscoverability_thematicClarityComment || "",
                suggestedText: originalData.seoAndDiscoverability?.suggestedOptimizedOnScreenText || feedbackJson.seoAndDiscoverability_suggestedOptimizedOnScreenText || "",
                suggestedCopy: originalData.seoAndDiscoverability?.suggestedOptimizedCopy || feedbackJson.seoAndDiscoverability_suggestedOptimizedCopy || "",
                trucoFlow: "Texto no visible que se coloca dentro del editor de la plataforma para mejorar la indexación y distribución del contenido."
              },
              
              nativeCodes: originalData.platformNativeElements?.integrationEffectivenessComment || feedbackJson.platformNativeElements_integrationEffectivenessComment || "",
              
              engagementPotential: {
                interaction: originalData.engagementOptimization?.interactionHierarchyComment || feedbackJson.engagementOptimization_interactionHierarchyComment || "",
                watchTime: originalData.engagementOptimization?.watchTimePotentialComment || feedbackJson.engagementOptimization_watchTimePotentialComment || ""
              }
            };
            
            processedFeedback.push(aiResponse);
            
          } catch (parseError) {
            console.error('Error parsing feedback data:', parseError);
          }
        }
        
        console.log(`Processed ${processedFeedback.length} feedback items`);
        
        if (processedFeedback.length > 0) {
          setFeedback(processedFeedback);
        } else {
          console.log("No valid feedback data could be processed");
        }
      } else {
        console.log("No feedback data found for this video");
      }
    } catch (err) {
      console.error('Error fetching video:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch video');
    } finally {
      setLoading(false);
    }
  }, [queryVideoId, user]);

  const toggleFavorite = async () => {
    if (!video || !user) return;
    
    try {
      const newFavoriteStatus = !video.is_favorite;
      
      const { error } = await supabase
        .from('videos')
        .update({ 
          is_favorite: newFavoriteStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', video.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setVideo({
        ...video,
        is_favorite: newFavoriteStatus
      });
      
    } catch (err) {
      console.error('Error updating favorite status:', err);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  useEffect(() => {
    if (unauthorized) {
      navigate('/history', { 
        replace: true,
        state: { 
          error: 'No tienes permiso para acceder a este video o no existe'
        }
      });
    }
  }, [unauthorized, navigate]);

  const videoData = video;
  const hasFeedback = feedback && feedback.length > 0;

  return { 
    video, 
    videoData,
    feedback,
    hasFeedback,
    toggleFavorite,
    loading, 
    error,
    unauthorized
  };
};
