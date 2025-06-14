
import React from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import { AdvancedTextEditor } from './AdvancedTextEditor';

interface NewTextEditorProps {
  onContentChange?: (content: string) => void;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ onContentChange }) => {
  const {
    sections,
    getAllContent
  } = useSimpleEditor();

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
        />
      ))}
    </div>
  );
};

export default NewTextEditor;
