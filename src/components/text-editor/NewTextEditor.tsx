import React, { useState, useEffect, useMemo } from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import { AdvancedTextEditor } from './AdvancedTextEditor';
import { CreativeZone } from './CreativeZone';
import { ShotSummary } from './ShotSummary';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';
import { useSupabaseAutosave } from '@/hooks/use-supabase-autosave';
import { useSharedShots } from '@/hooks/use-shared-shots';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layout, Save, Camera } from 'lucide-react';

interface InitialData {
  hook?: string;
  build_up?: string;
  value_add?: string;
  call_to_action?: string;
  shots?: any[];
}

interface NewTextEditorProps {
  onContentChange?: (content: string, sections?: any[]) => void;
  videoContextId?: string;
  clearOnMount?: boolean;
  initialData?: InitialData;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ 
  onContentChange, 
  videoContextId,
  clearOnMount = false,
  initialData
}) => {
  const [editorMode, setEditorMode] = useState<'structured' | 'free'>('structured');
  const [freeContent, setFreeContent] = useState('');
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  const contextId = useMemo(() => {
    return videoContextId || `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [videoContextId]);

  const {
    sections,
    getAllContent,
    updateSectionContent,
    loadInitialContent
  } = useSimpleEditor();

  const { shots: globalShots, setShots, initializeShots } = useSharedShots(contextId);

  const {
    creativeItems,
    addCreativeItem,
    removeCreativeItem,
    getShotsBySection,
    clearEditorState,
    getAllShots
  } = useAdvancedEditor('', contextId);

  const { saveState, saveAllSections } = useSupabaseAutosave(contextId);

  // Load initial data when editing
  useEffect(() => {
    if (initialData && !isInitialDataLoaded && !clearOnMount) {
      console.log('🔄 Cargando datos iniciales en editor:', {
        hasHook: !!initialData.hook,
        hasBuildUp: !!initialData.build_up,
        hasValueAdd: !!initialData.value_add,
        hasCTA: !!initialData.call_to_action,
        shotsCount: initialData.shots?.length || 0,
        shotsType: initialData.shots?.length > 0 ? typeof initialData.shots[0] : 'none'
      });
      
      // Load section content
      if (typeof loadInitialContent === 'function') {
        loadInitialContent(initialData);
      } else {
        if (initialData.hook) updateSectionContent('hook', initialData.hook);
        if (initialData.build_up) updateSectionContent('buildup', initialData.build_up);
        if (initialData.value_add) updateSectionContent('value', initialData.value_add);
        if (initialData.call_to_action) updateSectionContent('cta', initialData.call_to_action);
      }
      
      // Load shots with improved parsing for both string and object formats
      if (initialData.shots && Array.isArray(initialData.shots)) {
        const validatedShots = initialData.shots.map((shot, index) => {
          let processedShot;
          
          // Handle both string and object formats
          if (typeof shot === 'string') {
            try {
              processedShot = JSON.parse(shot);
              console.log(`📦 Toma ${index + 1} parseada desde string:`, processedShot.name);
            } catch (error) {
              console.warn(`❌ Error parseando toma ${index + 1}:`, error);
              return null;
            }
          } else if (typeof shot === 'object' && shot !== null) {
            processedShot = shot;
            console.log(`📦 Toma ${index + 1} ya es objeto:`, processedShot.name);
          } else {
            console.warn(`❌ Formato de toma inválido ${index + 1}:`, typeof shot);
            return null;
          }

          // Validate and build the shot
          const validatedShot = {
            id: processedShot.id || `shot-${Date.now()}-${index}`,
            name: processedShot.name || `Toma ${index + 1}`,
            color: processedShot.color || '#3B82F6',
            textSegments: Array.isArray(processedShot.textSegments) ? processedShot.textSegments.map((segment: any) => {
              let processedSegment;
              
              // Handle both string and object formats for segments too
              if (typeof segment === 'string') {
                try {
                  processedSegment = JSON.parse(segment);
                } catch (error) {
                  console.warn('Error parseando segmento:', error);
                  return null;
                }
              } else {
                processedSegment = segment;
              }
              
              if (!processedSegment) return null;

              return {
                id: processedSegment.id || `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                text: processedSegment.text || '',
                shotId: processedShot.id,
                startIndex: typeof processedSegment.startIndex === 'number' ? processedSegment.startIndex : 0,
                endIndex: typeof processedSegment.endIndex === 'number' ? processedSegment.endIndex : 0,
                isStrikethrough: Boolean(processedSegment.isStrikethrough),
                comments: Array.isArray(processedSegment.comments) ? processedSegment.comments.map((comment: any) => ({
                  id: comment.id || `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  text: comment.text || '',
                  timestamp: comment.timestamp || Date.now()
                })) : []
              };
            }).filter((segment: any) => segment !== null && segment?.text?.trim() !== '') : []
          };

          console.log(`📝 Toma validada ${index + 1}:`, {
            id: validatedShot.id,
            name: validatedShot.name,
            textSegmentsCount: validatedShot.textSegments.length,
            hasValidSegments: validatedShot.textSegments.some(seg => seg.text.trim() !== '')
          });

          return validatedShot;
        }).filter(shot => shot !== null && shot.textSegments.length > 0); // Solo mantener tomas válidas con segmentos

        console.log('✅ Inicializando tomas validadas:', {
          originalCount: initialData.shots.length,
          validatedCount: validatedShots.length,
          totalSegments: validatedShots.reduce((acc, shot) => acc + shot.textSegments.length, 0)
        });

        initializeShots(validatedShots);
      }
      
      setIsInitialDataLoaded(true);
    }
  }, [initialData, isInitialDataLoaded, clearOnMount, loadInitialContent, updateSectionContent, initializeShots]);

  // Clear editor state when starting a new video
  useEffect(() => {
    if (clearOnMount) {
      clearEditorState();
      setFreeContent('');
      setIsInitialDataLoaded(false);
      console.log('🧹 Editor limpiado para nuevo video con contexto:', contextId);
    }
  }, [clearOnMount, clearEditorState, contextId]);

  // Track content changes and provide comprehensive section data to parent
  useEffect(() => {
    const currentContent = editorMode === 'structured' ? getAllContent() : freeContent;
    
    if (editorMode === 'structured') {
      // Get all shots with complete text segments data
      const allCurrentShots = getAllShots();
      
      console.log('📊 Actualizando contenido estructurado:', {
        sectionsCount: sections.length,
        totalShots: allCurrentShots.length,
        shotsWithSegments: allCurrentShots.filter(shot => shot.textSegments && shot.textSegments.length > 0).length
      });

      // Provide detailed section information with shots that include complete text segments
      const sectionsWithCompleteShots = sections.map(section => {
        // Get shots specific to this section (in this case, all global shots)
        const sectionShots = getShotsBySection(section.id);
        
        // Ensure each shot has complete text segment data
        const completeShots = sectionShots.map(shot => {
          const completeShot = {
            ...shot,
            textSegments: Array.isArray(shot.textSegments) ? shot.textSegments.map(segment => ({
              id: segment.id,
              text: segment.text || '',
              shotId: shot.id,
              startIndex: typeof segment.startIndex === 'number' ? segment.startIndex : 0,
              endIndex: typeof segment.endIndex === 'number' ? segment.endIndex : 0,
              isStrikethrough: Boolean(segment.isStrikethrough),
              comments: Array.isArray(segment.comments) ? segment.comments.map(comment => ({
                id: comment.id,
                text: comment.text || '',
                timestamp: comment.timestamp || Date.now()
              })) : []
            })) : []
          };

          return completeShot;
        }).filter(shot => shot.textSegments.length > 0); // Solo incluir tomas con segmentos válidos
        
        return {
          ...section,
          shots: completeShots
        };
      });
      
      console.log('📤 Enviando datos de secciones al padre:', {
        sectionsCount: sectionsWithCompleteShots.length,
        sectionsWithShots: sectionsWithCompleteShots.filter(s => s.shots.length > 0).length,
        totalShotsInSections: sectionsWithCompleteShots.reduce((acc, s) => acc + s.shots.length, 0)
      });
      
      onContentChange?.(currentContent, sectionsWithCompleteShots);
    } else {
      // For free mode, get all shots with complete data
      const allCurrentShots = getAllShots();
      const completeShots = allCurrentShots.map(shot => ({
        ...shot,
        textSegments: Array.isArray(shot.textSegments) ? shot.textSegments.map(segment => ({
          id: segment.id,
          text: segment.text || '',
          shotId: shot.id,
          startIndex: typeof segment.startIndex === 'number' ? segment.startIndex : 0,
          endIndex: typeof segment.endIndex === 'number' ? segment.endIndex : 0,
          isStrikethrough: Boolean(segment.isStrikethrough),
          comments: Array.isArray(segment.comments) ? segment.comments : []
        })) : []
      })).filter(shot => shot.textSegments.length > 0);

      const freeModeSection = [{
        id: 'free-mode',
        title: 'Guión Libre',
        content: freeContent,
        shots: completeShots
      }];
      onContentChange?.(currentContent, freeModeSection);
    }
  }, [sections, freeContent, editorMode, onContentChange, getAllContent, getShotsBySection, getAllShots]);

  const switchMode = (mode: 'structured' | 'free') => {
    if (mode === 'free' && editorMode === 'structured') {
      const structuredContent = getAllContent();
      if (structuredContent.trim()) {
        setFreeContent(structuredContent);
      }
    } else if (mode === 'structured' && editorMode === 'free') {
      if (freeContent.trim() && sections.length > 0) {
        updateSectionContent(sections[0].id, freeContent);
      }
    }
    setEditorMode(mode);
  };

  const handleSaveAll = async () => {
    const allCurrentShots = getAllShots();
    
    if (editorMode === 'structured') {
      const sectionsToSave = sections.map(section => {
        const sectionShots = getShotsBySection(section.id);
        const completeSectionShots = sectionShots.map(shot => ({
          ...shot,
          textSegments: Array.isArray(shot.textSegments) ? shot.textSegments.map(segment => ({
            id: segment.id,
            text: segment.text || '',
            shotId: shot.id,
            startIndex: typeof segment.startIndex === 'number' ? segment.startIndex : 0,
            endIndex: typeof segment.endIndex === 'number' ? segment.endIndex : 0,
            isStrikethrough: Boolean(segment.isStrikethrough),
            comments: Array.isArray(segment.comments) ? segment.comments : []
          })) : []
        })).filter(shot => shot.textSegments.length > 0);
        
        return {
          sectionId: section.id,
          content: section.content,
          shots: completeSectionShots,
          title: section.title
        };
      });
      await saveAllSections(sectionsToSave);
    } else {
      const completeFreeShots = allCurrentShots.map(shot => ({
        ...shot,
        textSegments: Array.isArray(shot.textSegments) ? shot.textSegments.map(segment => ({
          id: segment.id,
          text: segment.text || '',
          shotId: shot.id,
          startIndex: typeof segment.startIndex === 'number' ? segment.startIndex : 0,
          endIndex: typeof segment.endIndex === 'number' ? segment.endIndex : 0,
          isStrikethrough: Boolean(segment.isStrikethrough),
          comments: Array.isArray(segment.comments) ? segment.comments : []
        })) : []
      })).filter(shot => shot.textSegments.length > 0);
      
      await saveAllSections([{
        sectionId: 'free-mode',
        content: freeContent,
        shots: completeFreeShots,
        title: 'Guión Libre'
      }]);
    }
  };

  const hasContent = editorMode === 'structured' 
    ? sections.some(section => section.content.trim().length > 0)
    : freeContent.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Estructura del Guión</h2>
            <p className="text-gray-600 text-sm">
              Elige cómo quieres organizar tu contenido
            </p>
            {globalShots.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Camera className="h-4 w-4 text-flow-blue" />
                <span className="text-sm text-flow-blue font-medium">
                  {globalShots.length} toma{globalShots.length !== 1 ? 's' : ''} creada{globalShots.length !== 1 ? 's' : ''}
                  {globalShots.reduce((acc, shot) => acc + (shot.textSegments?.length || 0), 0) > 0 && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({globalShots.reduce((acc, shot) => acc + (shot.textSegments?.length || 0), 0)} segmentos)
                    </span>
                  )}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Contexto: {contextId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={editorMode === 'structured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchMode('structured')}
              className="flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              Estructurado
            </Button>
            <Button
              variant={editorMode === 'free' ? 'default' : 'outline'}
              size="sm"
              onClick={() => switchMode('free')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Libre
            </Button>
            <Button
              onClick={handleSaveAll}
              disabled={saveState.isSaving || !hasContent}
              className="bg-flow-blue hover:bg-flow-blue/90 flex items-center gap-2"
            >
              {saveState.isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveState.isSaving ? 'Guardando...' : 'Guardar Todo'}
            </Button>
          </div>
        </div>
        
        {saveState.lastSaved && (
          <div className="text-sm text-green-600 text-right">
            Último guardado: {saveState.lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {editorMode === 'structured' ? (
        <div className="space-y-6">
          {sections.map((section) => (
            <AdvancedTextEditor
              key={section.id}
              title={section.title}
              description={section.description}
              placeholder={section.placeholder}
              content={section.content}
              onContentChange={(content) => {
                updateSectionContent(section.id, content);
              }}
              showCreativeZone={false}
              hideEmptyShots={!hasContent}
              sectionId={section.id}
              showSaveButton={false}
              videoContextId={contextId}
            />
          ))}
        </div>
      ) : (
        <AdvancedTextEditor
          title="Guión Libre"
          description="Escribe tu guión libremente. Puedes seleccionar texto para crear tomas específicas y añadir comentarios."
          placeholder="Escribe tu guión aquí... Puedes estructurarlo como prefieras y crear tomas seleccionando el texto."
          content={freeContent}
          onContentChange={setFreeContent}
          showCreativeZone={false}
          hideEmptyShots={!hasContent}
          sectionId="free-mode"
          showSaveButton={false}
          videoContextId={contextId}
        />
      )}

      <CreativeZone
        items={creativeItems}
        onAddItem={addCreativeItem}
        onRemoveItem={removeCreativeItem}
        title="Zona Creativa del Video"
        description="Ideas, referencias e inspiración para todo tu video"
      />

      {hasContent && globalShots.length > 0 && (
        <Card className="border-flow-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-flow-blue">
              <Camera className="h-5 w-5" />
              Tomas del Video ({globalShots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Estas tomas están disponibles en todas las secciones de tu guión.
            </p>
            <ShotSummary shots={globalShots} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewTextEditor;
