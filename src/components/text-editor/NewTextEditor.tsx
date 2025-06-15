
import React, { useState, useEffect } from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import { AdvancedTextEditor } from './AdvancedTextEditor';
import { CreativeZone } from './CreativeZone';
import { ShotSummary } from './ShotSummary';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layout, AlertTriangle } from 'lucide-react';

interface NewTextEditorProps {
  onContentChange?: (content: string) => void;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ onContentChange }) => {
  const [editorMode, setEditorMode] = useState<'structured' | 'free'>('structured');
  const [freeContent, setFreeContent] = useState('');
  const [title, setTitle] = useState('Guión sin título');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    sections,
    getAllContent,
    updateSectionContent
  } = useSimpleEditor();

  const {
    shots: allShots,
    creativeItems,
    addCreativeItem,
    removeCreativeItem
  } = useAdvancedEditor();

  // Track changes
  useEffect(() => {
    const currentContent = editorMode === 'structured' ? getAllContent() : freeContent;
    onContentChange?.(currentContent);
    setHasUnsavedChanges(true);
  }, [sections, freeContent, editorMode, onContentChange, getAllContent]);

  // Warning before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Tienes cambios sin guardar.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

  const hasContent = editorMode === 'structured' 
    ? sections.some(section => section.content.trim().length > 0)
    : freeContent.trim().length > 0;

  const getAllShots = () => {
    return allShots;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Estructura del Guión</h2>
            <p className="text-gray-600 text-sm">
              Elige cómo quieres organizar tu contenido
            </p>
          </div>
          <div className="flex gap-2">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">Cambios sin guardar</span>
              </div>
            )}
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
        />
      )}

      <CreativeZone
        items={creativeItems}
        onAddItem={addCreativeItem}
        onRemoveItem={removeCreativeItem}
        title="Zona Creativa del Video"
        description="Ideas, referencias e inspiración para todo tu video"
      />

      {hasContent && getAllShots().length > 0 && (
        <ShotSummary shots={getAllShots()} />
      )}
    </div>
  );
};

export default NewTextEditor;
