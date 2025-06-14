
import React from 'react';
import { useSimpleEditor } from '@/hooks/use-simple-editor';
import BasicTextEditor from './BasicTextEditor';

interface NewTextEditorProps {
  onContentChange?: (content: string) => void;
}

const NewTextEditor: React.FC<NewTextEditorProps> = ({ onContentChange }) => {
  const {
    sections,
    shots,
    updateSectionContent,
    addShot,
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
        <BasicTextEditor
          key={section.id}
          title={section.title}
          description={section.description}
          placeholder={section.placeholder}
          content={section.content}
          shots={shots}
          onContentChange={(content) => updateSectionContent(section.id, content)}
          onAddShot={addShot}
        />
      ))}
    </div>
  );
};

export default NewTextEditor;
