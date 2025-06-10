
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useTextEditor } from '@/hooks/use-text-editor';
import ShotSelectionMenu from './ShotSelectionMenu';
import ShotManager from './ShotManager';
import InspirationManager from './InspirationManager';
import TextSegmentInfo from './TextSegmentInfo';

interface NotionStyleEditorProps {
  placeholder?: string;
  onContentChange?: (content: string) => void;
}

const NotionStyleEditor: React.FC<NotionStyleEditorProps> = ({ 
  placeholder = "Escribe tu guión aquí...",
  onContentChange 
}) => {
  const {
    content,
    setContent,
    segments,
    shots,
    inspirations,
    selectedText,
    showShotMenu,
    menuPosition,
    editorRef,
    handleTextSelection,
    addShot,
    assignShotToText,
    addInspiration,
    updateSegmentInfo,
    setShowShotMenu,
    applySegmentStyling
  } = useTextEditor();

  useEffect(() => {
    onContentChange?.(content);
  }, [content, onContentChange]);

  useEffect(() => {
    // Apply styling to segments whenever content or segments change
    if (editorRef.current) {
      applySegmentStyling();
    }
  }, [content, segments, applySegmentStyling]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    setContent(newContent);
  };

  return (
    <div className="space-y-8">
      {/* Editor Principal */}
      <Card className="relative overflow-hidden border-0 shadow-sm bg-white">
        <div className="p-8">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            className="min-h-[400px] focus:outline-none text-gray-900 leading-relaxed text-lg"
            style={{ 
              fontSize: '18px',
              lineHeight: '1.8',
              fontFamily: 'var(--font-satoshi, system-ui, sans-serif)'
            }}
            data-placeholder={placeholder}
          />
          
          {content === '' && (
            <div 
              className="absolute top-8 left-8 text-gray-400 pointer-events-none text-lg"
              style={{ fontSize: '18px' }}
            >
              {placeholder}
            </div>
          )}
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
      </Card>

      {/* Gestión de Planos/Tomas */}
      <ShotManager 
        shots={shots}
        onAddShot={addShot}
      />

      {/* Información de Segmentos */}
      {segments.length > 0 && (
        <TextSegmentInfo
          segments={segments}
          shots={shots}
          onUpdateInfo={updateSegmentInfo}
        />
      )}

      {/* Gestión de Inspiraciones */}
      <InspirationManager
        inspirations={inspirations}
        onAddInspiration={addInspiration}
      />
    </div>
  );
};

export default NotionStyleEditor;
