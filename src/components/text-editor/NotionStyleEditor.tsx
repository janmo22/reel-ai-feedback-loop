
import React, { useEffect, useRef } from 'react';
import { useTextEditor, SECTION_TYPES } from '@/hooks/use-text-editor';
import ShotSelectionMenu from './ShotSelectionMenu';
import TextSegmentInfo from './TextSegmentInfo';
import ScriptSection from './ScriptSection';
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
    editorRefs,
    handleTextSelection,
    addShot,
    assignShotToText,
    addInspiration,
    updateSegmentInfo,
    addSegmentInfo,
    removeSegment,
    updateSectionContent,
    setShowShotMenu,
    applySegmentStyling,
    getAllContent,
    getAllSegments,
    toggleSectionCollapse,
    toggleShotRecorded
  } = useTextEditor();

  // Create refs for each section
  const hookRef = useRef<HTMLDivElement>(null);
  const buildupRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Store refs in the hook
  useEffect(() => {
    editorRefs.current = {
      hook: hookRef.current,
      buildup: buildupRef.current,
      value: valueRef.current,
      cta: ctaRef.current
    };
  }, [editorRefs]);

  useEffect(() => {
    onContentChange?.(getAllContent());
  }, [sections, onContentChange, getAllContent]);

  const sectionRefs = {
    hook: hookRef,
    buildup: buildupRef,
    value: valueRef,
    cta: ctaRef
  };

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
          <ScriptSection
            key={section.id}
            section={section}
            onContentChange={(content) => updateSectionContent(section.id, content)}
            onTextSelection={() => handleTextSelection(section.id)}
            onApplyStyling={() => applySegmentStyling(section.id)}
            onToggleCollapse={() => toggleSectionCollapse(section.id)}
            onAddSegmentInfo={(segmentId, info) => addSegmentInfo(section.id, segmentId, info)}
            onRemoveSegment={(segmentId) => removeSegment(section.id, segmentId)}
            shots={shots}
            editorRef={sectionRefs[section.type as keyof typeof sectionRefs]}
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
          onUpdateInfo={(segmentId, information) => {
            const segment = getAllSegments().find(s => s.id === segmentId);
            if (segment && 'sectionId' in segment) {
              updateSegmentInfo(segment.sectionId, segmentId, information);
            }
          }}
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
