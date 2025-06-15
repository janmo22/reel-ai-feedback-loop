
import React, { useState, useEffect } from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import { AdvancedTextEditor } from './AdvancedTextEditor';
import { CreativeZone } from './CreativeZone';
import { ShotSummary } from './ShotSummary';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';
import { useSupabaseAutosave } from '@/hooks/use-supabase-autosave';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layout, Save } from 'lucide-react';

interface NewTextEditorProps {
  onContentChange?: (content: string) => void;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ onContentChange }) => {
  const [editorMode, setEditorMode] = useState<'structured' | 'free'>('structured');
  const [freeContent, setFreeContent] = useState('');

  const {
    sections,
    getAllContent,
    updateSectionContent
  } = useSimpleEditor();

  const {
    shots: allShots,
    creativeItems,
    addCreativeItem,
    removeCreativeItem,
    getShotsBySection
  } = useAdvancedEditor();

  const { saveState, saveAllSections } = useSupabaseAutosave();

  // Track content changes
  useEffect(() => {
    const currentContent = editorMode === 'structured' ? getAllContent() : freeContent;
    onContentChange?.(currentContent);
  }, [sections, freeContent, editorMode, onContentChange, getAllContent]);

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
        shots: getShotsBySection(section.id),
        title: section.title
      }));
      await saveAllSections(sectionsToSave);
    } else {
      await saveAllSections([{
        sectionId: 'free-mode',
        content: freeContent,
        shots: getShotsBySection('free-mode'),
        title: 'Guión Libre'
      }]);
    }
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
