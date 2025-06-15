
import React, { useState, useEffect } from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import { AdvancedTextEditor } from './AdvancedTextEditor';
import { CreativeZone } from './CreativeZone';
import { ShotSummary } from './ShotSummary';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';
import { useSupabaseAutosave } from '@/hooks/use-supabase-autosave';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layout, Save, Cloud, AlertCircle } from 'lucide-react';

interface NewTextEditorProps {
  onContentChange?: (content: string) => void;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ onContentChange }) => {
  const [editorMode, setEditorMode] = useState<'structured' | 'free'>('structured');
  const [freeContent, setFreeContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('Guión sin título');

  const {
    sections,
    getAllContent,
    updateSectionContent
  } = useSimpleEditor();

  // Global creative zone and shots for the entire video
  const {
    shots: allShots,
    creativeItems,
    addCreativeItem,
    removeCreativeItem
  } = useAdvancedEditor();

  // Supabase autosave
  const {
    autosaveState,
    scheduleAutosave,
    manualSave,
    loadFromSupabase
  } = useSupabaseAutosave();

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      setIsLoading(true);
      const savedData = await loadFromSupabase();
      
      if (savedData) {
        setTitle(savedData.title);
        setEditorMode(savedData.editorMode);
        
        if (savedData.editorMode === 'free') {
          setFreeContent(savedData.content);
        } else {
          // Load sections content
          savedData.sections.forEach((section: any) => {
            updateSectionContent(section.id, section.content);
          });
        }
      }
      
      setIsLoading(false);
    };

    loadSavedData();
  }, [loadFromSupabase, updateSectionContent]);

  // Auto-save effect
  useEffect(() => {
    if (isLoading) return;

    const currentContent = editorMode === 'structured' ? getAllContent() : freeContent;
    scheduleAutosave(
      currentContent,
      editorMode,
      sections,
      allShots,
      creativeItems,
      title
    );
  }, [sections, freeContent, editorMode, allShots, creativeItems, title, scheduleAutosave, getAllContent, isLoading]);

  // Content change effect
  useEffect(() => {
    if (editorMode === 'structured') {
      onContentChange?.(getAllContent());
    } else {
      onContentChange?.(freeContent);
    }
  }, [sections, freeContent, editorMode, onContentChange, getAllContent]);

  // Function to switch modes and transfer content
  const switchMode = (mode: 'structured' | 'free') => {
    if (mode === 'free' && editorMode === 'structured') {
      // Transfer structured content to free mode
      const structuredContent = getAllContent();
      if (structuredContent.trim()) {
        setFreeContent(structuredContent);
      }
    } else if (mode === 'structured' && editorMode === 'free') {
      // Transfer free content to structured mode (to the first section)
      if (freeContent.trim() && sections.length > 0) {
        updateSectionContent(sections[0].id, freeContent);
      }
    }
    setEditorMode(mode);
  };

  // Check if there's any content written
  const hasContent = editorMode === 'structured' 
    ? sections.some(section => section.content.trim().length > 0)
    : freeContent.trim().length > 0;

  // Collect all shots from all sections (for structured mode)
  const getAllShots = () => {
    return allShots;
  };

  // Manual save function
  const handleManualSave = async () => {
    const currentContent = editorMode === 'structured' ? getAllContent() : freeContent;
    await manualSave(
      currentContent,
      editorMode,
      sections,
      allShots,
      creativeItems,
      title
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu guión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with mode selector and save info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Estructura del Guión</h2>
            <p className="text-gray-600 text-sm">
              Elige cómo quieres organizar tu contenido
            </p>
            {autosaveState.lastSaved && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                Guardado: {autosaveState.lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={autosaveState.isSaving}
              className="flex items-center gap-2"
            >
              {autosaveState.isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {autosaveState.isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
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
          </div>
        </div>

        {/* Autosave status */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          {autosaveState.isSaving ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Guardando en la nube...</span>
            </>
          ) : autosaveState.hasUnsavedChanges ? (
            <>
              <AlertCircle className="h-3 w-3 text-amber-500" />
              <span>Cambios pendientes de guardar</span>
            </>
          ) : (
            <>
              <Cloud className="h-3 w-3 text-green-600" />
              <span>Autoguardado en la nube activado - Se guarda automáticamente cada 3 segundos</span>
            </>
          )}
        </div>
      </div>

      {/* Content based on mode */}
      {editorMode === 'structured' ? (
        // Structured mode - existing sections
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
            />
          ))}
        </div>
      ) : (
        // Free mode - single text area
        <AdvancedTextEditor
          title="Guión Libre"
          description="Escribe tu guión libremente. Puedes seleccionar texto para crear tomas específicas y añadir comentarios."
          placeholder="Escribe tu guión aquí... Puedes estructurarlo como prefieras y crear tomas seleccionando el texto."
          content={freeContent}
          onContentChange={setFreeContent}
          showCreativeZone={false}
          hideEmptyShots={!hasContent}
        />
      )}

      {/* Global Creative Zone */}
      <CreativeZone
        items={creativeItems}
        onAddItem={addCreativeItem}
        onRemoveItem={removeCreativeItem}
        title="Zona Creativa del Video"
        description="Ideas, referencias e inspiración para todo tu video"
      />

      {/* Shot Summary - only show if there are shots */}
      {hasContent && getAllShots().length > 0 && (
        <ShotSummary shots={getAllShots()} />
      )}
    </div>
  );
};

export default NewTextEditor;
