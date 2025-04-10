
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useVideoResults } from "@/hooks/use-video-results";
import VideoActions from "@/components/results/VideoActions";
import SuggestedCopy from "@/components/results/SuggestedCopy";
import LoadingResults from "@/components/results/LoadingResults";
import NoResults from "@/components/results/NoResults";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/layout/Footer";
import ResultsFeedback from "@/components/results/ResultsFeedback";

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProcessing = location.state?.videoData?.isProcessing === true;
  const { feedback, videoData, loading, hasFeedback, toggleFavorite, error } = useVideoResults();
  const { toast } = useToast();
  
  const handleShare = () => {
    toast({
      title: "Compartir resultados",
      description: "Funcionalidad de compartir en desarrollo."
    });
  };
  
  // Show loading screen if the video is currently being processed
  // or if we're still loading data
  if (loading || isProcessing) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 py-8 px-4 flex items-center justify-center">
          <LoadingResults />
        </main>
        <Footer />
      </div>
    );
  }
  
  // Show error state if there was an error loading the data
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <NoResults />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Ensure feedback data is available
  if (!hasFeedback || !feedback || !videoData) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <NoResults />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Get the first feedback item
  const feedbackItem = feedback[0];
  const fd = feedbackItem.feedback_data;
  
  // Determine content details
  const contentTitle = videoData.title || "Análisis de Reel";
  const contentSubtitle = fd?.executiveSummary 
    ? "Evaluación ejecutiva" 
    : "Evaluación de contenido";
  
  // Get overall score
  const score = feedbackItem.overallEvaluation?.score || 0;
  
  // Get executive summary
  const executiveSummary = fd?.executiveSummary || feedbackItem.generalStudy || "";
  
  // Get suggested copy
  const suggestedCopy = fd?.seoAndDiscoverability?.suggestedOptimizedCopy || "";
  const suggestedText = fd?.seoAndDiscoverability?.suggestedOptimizedOnScreenText || "";
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {contentTitle}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {contentSubtitle}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="inline-flex items-center justify-center rounded-full px-6 py-3 text-xl font-medium text-white bg-indigo-400">
                    Score: {score}/10
                  </div>
                </div>
              </div>
              
              <p className="text-lg mt-6">
                {executiveSummary}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 mb-6">
                <Tabs defaultValue="resumen" className="w-full">
                  <TabsList className="grid grid-cols-6 mb-6 w-full">
                    <TabsTrigger value="resumen">Resumen</TabsTrigger>
                    <TabsTrigger value="estructura">Estructura</TabsTrigger>
                    <TabsTrigger value="hook">Hook</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="estrategia">Estrategia</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="resumen" className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Evaluación General</h2>
                    <div className="space-y-6">
                      {feedbackItem.overallEvaluation.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          </div>
                          <p className="text-lg">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="estructura" className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Estructura del Contenido</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                              <line x1="6" y1="1" x2="6" y2="4"></line>
                              <line x1="10" y1="1" x2="10" y2="4"></line>
                              <line x1="14" y1="1" x2="14" y2="4"></line>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.videoStructureAndPacing?.buildUpAndPacingComment || 
                            "Mejorar la estructura narrativa para mantener el interés a lo largo del video."}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.videoStructureAndPacing?.valueDelivery?.comment || 
                            "Desarrollar mejor el argumento principal para que se entienda el valor del contenido."}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.videoStructureAndPacing?.ctaAndEnding?.comment || 
                            "Añadir una llamada a la acción más clara al final del video."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="hook" className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Análisis del Hook</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.videoStructureAndPacing?.hook?.attentionGrabbingComment || 
                            "El hook inicial necesita ser más impactante para captar la atención en los primeros segundos."}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.videoStructureAndPacing?.hook?.visualHookAnalysis || 
                            "El elemento visual de inicio no es suficientemente llamativo."}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.videoStructureAndPacing?.hook?.spokenHookAnalysis || 
                            "La introducción verbal podría ser más directa y clara."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="engagement" className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Potencial de Engagement</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                              <path d="M23 21v-2a4 4 0 0 1 0 7.75"></path>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.engagementOptimization?.interactionHierarchyComment || 
                            "Fomentar más la participación de la audiencia con preguntas directas."}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.engagementOptimization?.watchTimePotentialComment || 
                            "El ritmo podría mejorarse para aumentar el tiempo de visualización."}
                        </p>
                      </div>
                      
                      {fd?.engagementOptimization?.viralityFactorsComment && (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </div>
                          </div>
                          <p className="text-lg">{fd.engagementOptimization.viralityFactorsComment}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="seo" className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Optimización SEO</h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.seoAndDiscoverability?.keywordIdentificationComment || 
                            "Utilizar palabras clave más relevantes para tu nicho."}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="8" y1="6" x2="21" y2="6"></line>
                              <line x1="8" y1="12" x2="21" y2="12"></line>
                              <line x1="8" y1="18" x2="21" y2="18"></line>
                              <line x1="3" y1="6" x2="3.01" y2="6"></line>
                              <line x1="3" y1="12" x2="3.01" y2="12"></line>
                              <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.seoAndDiscoverability?.thematicClarityComment || 
                            "La temática principal debe ser más clara para el algoritmo."}
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                          </div>
                        </div>
                        <p className="text-lg">
                          {fd?.seoAndDiscoverability?.hashtagsSEOAnalysis || 
                            "Usar hashtags más específicos y relevantes para tu contenido."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="estrategia" className="p-6 border rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Alineación Estratégica</h2>
                    <div className="space-y-6">
                      {fd?.strategicAlignment?.creatorConsistencyComment && (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            </div>
                          </div>
                          <p className="text-lg">{fd.strategicAlignment.creatorConsistencyComment}</p>
                        </div>
                      )}
                      
                      {fd?.strategicAlignment?.targetAudienceClarityComment && (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                            </div>
                          </div>
                          <p className="text-lg">{fd.strategicAlignment.targetAudienceClarityComment}</p>
                        </div>
                      )}
                      
                      {fd?.strategicAlignment?.valuePropositionClarityComment && (
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                              </svg>
                            </div>
                          </div>
                          <p className="text-lg">{fd.strategicAlignment.valuePropositionClarityComment}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <SuggestedCopy 
                suggestedText={suggestedText}
                suggestedCopy={suggestedCopy}
              />
            </div>
            
            <div className="md:col-span-1">
              <VideoActions 
                onSave={toggleFavorite}
                onShare={handleShare}
                isFavorite={videoData.is_favorite}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResultsPage;
