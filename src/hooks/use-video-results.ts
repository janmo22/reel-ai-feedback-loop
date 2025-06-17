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
            
            const aiResponse: AIFeedbackResponse = {
              id: item.id,
              created_at: item.created_at,
              
              generalStudy: feedbackJson.executiveSummary || "",
              contentType: feedbackJson.contentTypeStrategy?.classification || "",
              contentTitle: videoData.title,
              contentSubtitle: "Análisis de rendimiento",
              
              feedback_data: {
                executiveSummary: feedbackJson.executiveSummary || "",
                finalEvaluation: {
                  overallScore: feedbackJson.finalEvaluation_overallScore || item.overall_score || 0,
                  finalRecommendations: Array.isArray(feedbackJson.finalEvaluation_finalRecommendations) 
                    ? feedbackJson.finalEvaluation_finalRecommendations 
                    : Array.isArray(feedbackJson.finalEvaluation?.finalRecommendations)
                      ? feedbackJson.finalEvaluation?.finalRecommendations
                      : []
                },
                strategicAlignment: {
                  targetAudienceClarityComment: feedbackJson.strategicAlignment_targetAudienceClarityComment || "",
                  valuePropositionClarityComment: feedbackJson.strategicAlignment_valuePropositionClarityComment || "",
                  creatorConsistencyComment: feedbackJson.strategicAlignment_creatorConsistencyComment || "",
                  recommendations: feedbackJson.strategicAlignment_recommendations || ""
                },
                contentTypeStrategy: {
                  classification: feedbackJson.contentTypeStrategy_classification || "",
                  trendAdaptationCritique: feedbackJson.contentTypeStrategy_trendAdaptationCritique || "",
                  seriesClarityAndHookComment: feedbackJson.contentTypeStrategy_seriesClarityAndHookComment || "",
                  recommendations: feedbackJson.contentTypeStrategy_recommendations || ""
                },
                seoAndDiscoverability: {
                  keywordIdentificationComment: feedbackJson.seoAndDiscoverability_keywordIdentificationComment || "",
                  thematicClarityComment: feedbackJson.seoAndDiscoverability_thematicClarityComment || "",
                  hashtagsSEOAnalysis: feedbackJson.seoAndDiscoverability_hashtagsSEOAnalysis || "",
                  searchBarPotentialComment: feedbackJson.seoAndDiscoverability_searchBarPotentialComment || "",
                  recommendations: feedbackJson.seoAndDiscoverability_recommendations || "",
                  suggestedOptimizedCopy: feedbackJson.seoAndDiscoverability_suggestedOptimizedCopy || "",
                  suggestedOptimizedOnScreenText: feedbackJson.seoAndDiscoverability_suggestedOptimizedOnScreenText || "",
                  onScreenTextSEOAanalysis: feedbackJson.seoAndDiscoverability_onScreenTextSEOAanalysis || "",
                  coverThumbnailPotentialComment: feedbackJson.seoAndDiscoverability_coverThumbnailPotentialComment || "",
                  copySEOAnalysis: feedbackJson.seoAndDiscoverability_copySEOAnalysis || "",
                  advancedDiscoveryFeaturesComment: feedbackJson.seoAndDiscoverability_advancedDiscoveryFeaturesComment || ""
                },
                engagementOptimization: {
                  interactionHierarchyComment: feedbackJson.engagementOptimization_interactionHierarchyComment || "",
                  watchTimePotentialComment: feedbackJson.engagementOptimization_watchTimePotentialComment || "",
                  viralityFactorsComment: feedbackJson.engagementOptimization_viralityFactorsComment || "",
                  recommendations: feedbackJson.engagementOptimization_recommendations || ""
                },
                platformNativeElements: {
                  identifiedElements: feedbackJson.platformNativeElements_identifiedElements || "",
                  integrationEffectivenessComment: feedbackJson.platformNativeElements_integrationEffectivenessComment || "",
                  recommendations: feedbackJson.platformNativeElements_recommendations || ""
                },
                videoStructureAndPacing: {
                  hook: {
                    attentionGrabbingComment: feedbackJson.videoStructureAndPacing_hook_attentionGrabbingComment || "",
                    auditoryHookAnalysis: feedbackJson.videoStructureAndPacing_hook_auditoryHookAnalysis || "",
                    visualHookAnalysis: feedbackJson.videoStructureAndPacing_hook_visualHookAnalysis || "",
                    clarityAndSimplicityComment: feedbackJson.videoStructureAndPacing_hook_clarityAndSimplicityComment || "",
                    authenticityFeelComment: feedbackJson.videoStructureAndPacing_hook_authenticityFeelComment || "",
                    viewerBenefitCommunicationComment: feedbackJson.videoStructureAndPacing_hook_viewerBenefitCommunicationComment || "",
                    patternDisruptionComment: feedbackJson.videoStructureAndPacing_hook_patternDisruptionComment || "",
                    strengths: feedbackJson.videoStructureAndPacing_hook_strengths || "",
                    weaknesses: feedbackJson.videoStructureAndPacing_hook_weaknesses || "",
                    recommendations: feedbackJson.videoStructureAndPacing_hook_recommendations || "",
                    spokenHookAnalysis: feedbackJson.videoStructureAndPacing_hook_spokenHookAnalysis || "",
                    overallEffectivenessScore: feedbackJson.videoStructureAndPacing_hook_overallEffectivenessScore || 0
                  },
                  buildUpAndPacingComment: feedbackJson.videoStructureAndPacing_buildUpAndPacingComment || "",
                  buildUpAndPacingRecommendations: feedbackJson.videoStructureAndPacing_buildUpAndPacingRecommendations || "",
                  valueDelivery: {
                    comment: feedbackJson.videoStructureAndPacing_valueDelivery_comment || "",
                    mainFunction: feedbackJson.videoStructureAndPacing_valueDelivery_mainFunction || "",
                    recommendations: feedbackJson.videoStructureAndPacing_valueDelivery_recommendations || "",
                    qualityScore: feedbackJson.videoStructureAndPacing_valueDelivery_qualityScore || 0
                  },
                  ctaAndEnding: {
                    comment: feedbackJson.videoStructureAndPacing_ctaAndEnding_comment || "",
                    recommendations: feedbackJson.videoStructureAndPacing_ctaAndEnding_recommendations || ""
                  }
                }
              },
              
              overallEvaluation: {
                score: feedbackJson.finalEvaluation_overallScore || item.overall_score || 0,
                suggestions: Array.isArray(feedbackJson.finalEvaluation_finalRecommendations) 
                  ? feedbackJson.finalEvaluation_finalRecommendations 
                  : []
              },
              
              structure: {
                hook: {
                  general: feedbackJson.videoStructureAndPacing_hook_attentionGrabbingComment || "",
                  spoken: feedbackJson.videoStructureAndPacing_hook_spokenHookAnalysis || "",
                  visual: feedbackJson.videoStructureAndPacing_hook_visualHookAnalysis || "",
                  auditory: feedbackJson.videoStructureAndPacing_hook_auditoryHookAnalysis || "",
                  clarity: feedbackJson.videoStructureAndPacing_hook_clarityAndSimplicityComment || "",
                  feel: feedbackJson.videoStructureAndPacing_hook_authenticityFeelComment || "",
                  invitation: feedbackJson.videoStructureAndPacing_hook_viewerBenefitCommunicationComment || "",
                  patternBreak: feedbackJson.videoStructureAndPacing_hook_patternDisruptionComment || "",
                  strengths: feedbackJson.videoStructureAndPacing_hook_strengths || "",
                  weaknesses: feedbackJson.videoStructureAndPacing_hook_weaknesses || "",
                  score: feedbackJson.videoStructureAndPacing_hook_overallEffectivenessScore || 0
                },
                buildUp: feedbackJson.videoStructureAndPacing_buildUpAndPacingComment || "",
                value: {
                  comment: feedbackJson.videoStructureAndPacing_valueDelivery_comment || "",
                  score: feedbackJson.videoStructureAndPacing_valueDelivery_qualityScore || 0,
                  function: feedbackJson.videoStructureAndPacing_valueDelivery_mainFunction || ""
                },
                cta: feedbackJson.videoStructureAndPacing_ctaAndEnding_comment || ""
              },
              
              seo: {
                keywordAnalysis: feedbackJson.seoAndDiscoverability_keywordIdentificationComment || "",
                clarity: feedbackJson.seoAndDiscoverability_thematicClarityComment || "",
                suggestedText: feedbackJson.seoAndDiscoverability_suggestedOptimizedOnScreenText || "",
                suggestedCopy: feedbackJson.seoAndDiscoverability_suggestedOptimizedCopy || "",
                trucoFlow: "Texto no visible que se coloca dentro del editor de la plataforma para mejorar la indexación y distribución del contenido."
              },
              
              nativeCodes: feedbackJson.platformNativeElements_integrationEffectivenessComment || "",
              
              engagementPotential: {
                interaction: feedbackJson.engagementOptimization_interactionHierarchyComment || "",
                watchTime: feedbackJson.engagementOptimization_watchTimePotentialComment || ""
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
