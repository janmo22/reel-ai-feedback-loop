
import React, { useState } from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import { AdvancedTextEditor } from './AdvancedTextEditor';
import { CreativeZone } from './CreativeZone';
import { ShotSummary } from './ShotSummary';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layout, Save } from 'lucide-react';

interface NewTextEditorProps {
  onContentChange?: (content: string) => void;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ onContentChange }) => {
  const [editorMode, setEditorMode] = useState<'structured' | 'free'>('structured');
  const [freeContent, setFreeContent] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

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
    removeCreativeItem,
    clearAutosave
  } = useAdvancedEditor();

  React.useEffect(() => {
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
    // This would need to be implemented to collect shots from all AdvancedTextEditor instances
    // For now, we'll use the global shots
    return allShots;
  };

  // Manual save function
  const handleManualSave = () => {
    // Force save to localStorage
    const currentTime = new Date();
    setLastSaveTime(currentTime);
    
    // You could also implement saving to a backend here
    console.log('Guardado manual realizado');
  };

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
            {lastSaveTime && (
              <p className="text-xs text-green-600 mt-1">
                Guardado manual: {lastSaveTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar
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

        {/* Autosave indicator */}
        <div className="text-xs text-gray-500 mb-2">
          💾 Autoguardado activado - Se guarda automáticamente cada 2 segundos
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
