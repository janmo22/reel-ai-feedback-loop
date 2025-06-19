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
  videoContextId?: string; // Optional prop, will generate one if not provided
  clearOnMount?: boolean; // New prop to control if editor should start clean
  initialData?: InitialData; // New prop for loading existing data
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

  // Generate unique video context ID if not provided
  const contextId = useMemo(() => {
    return videoContextId || `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [videoContextId]);

  const {
    sections,
    getAllContent,
    updateSectionContent,
    loadInitialContent
  } = useSimpleEditor();

  // Use shared shots system to get global shots for this video context
  const { shots: globalShots, setShots, initializeShots } = useSharedShots(contextId);

  const {
    creativeItems,
    addCreativeItem,
    removeCreativeItem,
    getShotsBySection,
    clearEditorState
  } = useAdvancedEditor('', contextId);

  const { saveState, saveAllSections } = useSupabaseAutosave(contextId);

  // Helper function to add shots using setShots
  const addGlobalShot = (name: string, color: string, shotData?: any) => {
    const newShot = {
      id: `shot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      textSegments: [],
      ...shotData
    };
    setShots(prev => [...prev, newShot]);
    return newShot;
  };

  // Load initial data when editing
  useEffect(() => {
    if (initialData && !isInitialDataLoaded && !clearOnMount) {
      console.log('Cargando datos iniciales en editor:', initialData);
      
      // Load section content
      if (typeof loadInitialContent === 'function') {
        loadInitialContent(initialData);
      } else {
        // Fallback: Update sections manually
        if (initialData.hook) updateSectionContent('hook', initialData.hook);
        if (initialData.build_up) updateSectionContent('buildup', initialData.build_up);
        if (initialData.value_add) updateSectionContent('value', initialData.value_add);
        if (initialData.call_to_action) updateSectionContent('cta', initialData.call_to_action);
      }
      
      // Load shots
      if (initialData.shots && Array.isArray(initialData.shots)) {
        const shotsToLoad = initialData.shots.map(shot => ({
          id: shot.id || `shot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: shot.name || 'Toma sin nombre',
          color: shot.color || '#3B82F6',
          textSegments: shot.textSegments || [],
          ...shot
        }));
        initializeShots(shotsToLoad);
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
      console.log('Editor limpiado para nuevo video con contexto:', contextId);
    }
  }, [clearOnMount, clearEditorState, contextId]);

  // Track content changes and provide section data to parent
  useEffect(() => {
    const currentContent = editorMode === 'structured' ? getAllContent() : freeContent;
    
    if (editorMode === 'structured') {
      // Provide detailed section information
      const sectionsWithShots = sections.map(section => ({
        ...section,
        shots: getShotsBySection(section.id)
      }));
      onContentChange?.(currentContent, sectionsWithShots);
    } else {
      // For free mode, create a single section
      const freeModeSection = [{
        id: 'free-mode',
        title: 'Guión Libre',
        content: freeContent,
        shots: globalShots
      }];
      onContentChange?.(currentContent, freeModeSection);
    }
  }, [sections, freeContent, editorMode, onContentChange, getAllContent, getShotsBySection, globalShots]);

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
    if (editorMode === 'structured') {
      const sectionsToSave = sections.map(section => ({
        sectionId: section.id,
        content: section.content,
        shots: getShotsBySection(section.id), // Use section-specific shots
        title: section.title
      }));
      await saveAllSections(sectionsToSave);
    } else {
      await saveAllSections([{
        sectionId: 'free-mode',
        content: freeContent,
        shots: globalShots, // Use global shots
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
            {/* Show shots count indicator */}
            {globalShots.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Camera className="h-4 w-4 text-flow-blue" />
                <span className="text-sm text-flow-blue font-medium">
                  {globalShots.length} toma{globalShots.length !== 1 ? 's' : ''} creada{globalShots.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {/* Debug info - remove in production */}
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
              videoContextId={contextId} // Pass the video context ID
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
          videoContextId={contextId} // Pass the video context ID
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
