
import React, { useEffect } from 'react';
import { useTextEditor, SECTION_TYPES } from '@/hooks/use-text-editor';
import ShotSelectionMenu from './ShotSelectionMenu';
import TextSegmentInfo from './TextSegmentInfo';
import SimpleTextEditor from './SimpleTextEditor';
import CreativeZone from './CreativeZone';

interface NotionStyleEditorProps {
  placeholder?: string;
  onContentChange?: (content: string) => void;
}

const NotionStyleEditor: React.FC<NotionStyleEditorProps> = ({ 
  onContentChange 
}) => {
  const {
    sections,
    shots,
    inspirations,
    selectedText,
    showShotMenu,
    menuPosition,
    handleTextSelection,
    addShot,
    assignShotToText,
    addInspiration,
    updateSectionContent,
    updateSectionSegments,
    setShowShotMenu,
    getAllContent,
    getAllSegments,
    toggleSectionCollapse,
    toggleShotRecorded
  } = useTextEditor();

  useEffect(() => {
    onContentChange?.(getAllContent());
  }, [sections, onContentChange, getAllContent]);

  return (
    <div className="space-y-6">
      {/* Secciones del guión */}
      <div className="space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Estructura del Guión</h2>
          <p className="text-gray-600 text-sm">
            Escribe tu contenido por secciones. Selecciona texto para asignar tomas específicas.
          </p>
        </div>

        {sections.map((section) => (
          <SimpleTextEditor
            key={section.id}
            title={SECTION_TYPES[section.type].label}
            description={SECTION_TYPES[section.type].description}
            placeholder={SECTION_TYPES[section.type].placeholder}
            content={section.content}
            segments={section.segments}
            collapsed={section.collapsed}
            shots={shots}
            onContentChange={(content) => updateSectionContent(section.id, content)}
            onSegmentsChange={(segments) => updateSectionSegments(section.id, segments)}
            onTextSelection={() => handleTextSelection(section.id)}
            onToggleCollapse={() => toggleSectionCollapse(section.id)}
          />
        ))}
      </div>

      {/* Menú de selección de tomas */}
      {showShotMenu && (
        <ShotSelectionMenu
          position={menuPosition}
          shots={shots}
          selectedText={selectedText.text}
          onSelectShot={assignShotToText}
          onAddNewShot={addShot}
          onClose={() => setShowShotMenu(false)}
        />
      )}

      {/* Gestión de Tomas */}
      {getAllSegments().length > 0 && (
        <TextSegmentInfo
          segments={getAllSegments()}
          shots={shots}
          onUpdateInfo={() => {}} // Simplificado por ahora
          onToggleRecorded={toggleShotRecorded}
        />
      )}

      {/* Zona Creativa */}
      <CreativeZone
        inspirations={inspirations}
        onAddInspiration={addInspiration}
      />
    </div>
  );
};

export default NotionStyleEditor;
