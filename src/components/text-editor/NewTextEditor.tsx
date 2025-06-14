
import React, { useState } from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import { AdvancedTextEditor } from './AdvancedTextEditor';
import { CreativeZone } from './CreativeZone';
import { ShotSummary } from './ShotSummary';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layout } from 'lucide-react';

interface NewTextEditorProps {
  onContentChange?: (content: string) => void;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ onContentChange }) => {
  const [editorMode, setEditorMode] = useState<'structured' | 'free'>('structured');
  const [freeContent, setFreeContent] = useState('');

  const {
    sections,
    getAllContent
  } = useSimpleEditor();

  // Global creative zone and shots for the entire video
  const {
    shots: allShots,
    creativeItems,
    addCreativeItem,
    removeCreativeItem
  } = useAdvancedEditor();

  React.useEffect(() => {
    if (editorMode === 'structured') {
      onContentChange?.(getAllContent());
    } else {
      onContentChange?.(freeContent);
    }
  }, [sections, freeContent, editorMode, onContentChange, getAllContent]);

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

  return (
    <div className="space-y-6">
      {/* Header with mode selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Estructura del Guión</h2>
            <p className="text-gray-600 text-sm">
              Elige cómo quieres organizar tu contenido
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={editorMode === 'structured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditorMode('structured')}
              className="flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              Estructurado
            </Button>
            <Button
              variant={editorMode === 'free' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEditorMode('free')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Libre
            </Button>
          </div>
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
                // Update the section content
                // This would need proper implementation in useSimpleEditor
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
          description="Escribe tu guión libremente. Puedes seleccionar texto para crear tomas específicas."
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
