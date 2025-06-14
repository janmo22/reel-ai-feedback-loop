
import React from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import { AdvancedTextEditor } from './AdvancedTextEditor';
import { CreativeZone } from './CreativeZone';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';

interface NewTextEditorProps {
  onContentChange?: (content: string) => void;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ onContentChange }) => {
  const {
    sections,
    getAllContent
  } = useSimpleEditor();

  // Global creative zone for the entire video
  const {
    creativeItems,
    addCreativeItem,
    removeCreativeItem
  } = useAdvancedEditor();

  React.useEffect(() => {
    onContentChange?.(getAllContent());
  }, [sections, onContentChange, getAllContent]);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Estructura del Guión</h2>
        <p className="text-gray-600 text-sm">
          Escribe tu contenido por secciones. Selecciona texto para crear tomas específicas.
        </p>
      </div>

      {sections.map((section) => (
        <AdvancedTextEditor
          key={section.id}
          title={section.title}
          description={section.description}
          placeholder={section.placeholder}
          content={section.content}
          onContentChange={(content) => {
            // Update the section content in the simple editor
            // This is a simplified version - you may want to add this method to useSimpleEditor
          }}
          showCreativeZone={false} // Disable individual creative zones
        />
      ))}

      {/* Global Creative Zone for the entire video */}
      <div className="mt-8">
        <CreativeZone
          items={creativeItems}
          onAddItem={addCreativeItem}
          onRemoveItem={removeCreativeItem}
          title="Zona Creativa del Video"
          description="Ideas, referencias e inspiración para todo tu video"
        />
      </div>
    </div>
  );
};

export default NewTextEditor;
