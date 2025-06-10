
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScriptSection as ScriptSectionType, SECTION_TYPES } from '@/hooks/use-text-editor';

interface ScriptSectionProps {
  section: ScriptSectionType;
  onContentChange: (content: string) => void;
  onTextSelection: () => void;
  onApplyStyling: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

const ScriptSection: React.FC<ScriptSectionProps> = ({
  section,
  onContentChange,
  onTextSelection,
  onApplyStyling,
  editorRef
}) => {
  const sectionConfig = SECTION_TYPES[section.type];

  useEffect(() => {
    // Apply styling when segments change
    if (editorRef.current && section.segments.length > 0) {
      onApplyStyling();
    }
  }, [section.segments, onApplyStyling]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    onContentChange(newContent);
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 mb-1">
              {sectionConfig.label}
            </CardTitle>
            <p className="text-sm text-gray-600">{sectionConfig.description}</p>
          </div>
          {section.segments.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {section.segments.length} {section.segments.length === 1 ? 'toma' : 'tomas'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            onMouseUp={onTextSelection}
            onKeyUp={onTextSelection}
            className="min-h-[120px] focus:outline-none text-gray-900 leading-relaxed text-base p-4 border border-gray-200 rounded-lg focus:border-gray-400 transition-colors"
            style={{ 
              fontSize: '16px',
              lineHeight: '1.6',
              fontFamily: 'var(--font-satoshi, system-ui, sans-serif)'
            }}
            data-placeholder={sectionConfig.placeholder}
          />
          
          {section.content === '' && (
            <div 
              className="absolute top-4 left-4 text-gray-400 pointer-events-none text-base"
              style={{ fontSize: '16px' }}
            >
              {sectionConfig.placeholder}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScriptSection;
