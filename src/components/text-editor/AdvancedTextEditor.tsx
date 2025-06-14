
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';
import { ShotSelector } from './ShotSelector';
import { ShotDisplay } from './ShotDisplay';
import { CreativeZone } from './CreativeZone';

interface AdvancedTextEditorProps {
  title: string;
  description: string;
  placeholder: string;
  content: string;
  onContentChange: (content: string) => void;
  showCreativeZone?: boolean;
}

export const AdvancedTextEditor: React.FC<AdvancedTextEditorProps> = ({
  title,
  description,
  placeholder,
  content,
  onContentChange,
  showCreativeZone = true
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showShotSelector, setShowShotSelector] = useState(false);
  
  const {
    content: editorContent,
    shots,
    selectedText,
    selectionRange,
    creativeItems,
    textareaRef,
    updateContent,
    createShot,
    assignToExistingShot,
    handleTextSelection,
    addCreativeItem,
    removeCreativeItem,
    getShotForText,
    toggleTextStrikethrough
  } = useAdvancedEditor(content);

  // Sync with parent component
  React.useEffect(() => {
    onContentChange(editorContent);
  }, [editorContent, onContentChange]);

  React.useEffect(() => {
    updateContent(content);
  }, [content, updateContent]);

  const handleTextSelectionEvent = () => {
    handleTextSelection();
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end) {
        setShowShotSelector(true);
      }
    }
  };

  const handleCreateShot = (name: string, color: string) => {
    createShot(name, color);
    setShowShotSelector(false);
  };

  const handleAssignToShot = (shotId: string) => {
    assignToExistingShot(shotId);
    setShowShotSelector(false);
  };

  // Render text with highlighting for shots
  const renderHighlightedText = () => {
    if (shots.length === 0) {
      return editorContent;
    }

    let result = [];
    let lastIndex = 0;
    const allSegments = shots.flatMap(shot => 
      shot.textSegments.map(segment => ({ ...segment, shotColor: shot.color }))
    ).sort((a, b) => a.startIndex - b.startIndex);

    allSegments.forEach((segment, index) => {
      // Add text before this segment
      if (segment.startIndex > lastIndex) {
        result.push({
          text: editorContent.substring(lastIndex, segment.startIndex),
          type: 'normal',
          key: `normal-${index}`
        });
      }

      // Add highlighted segment
      result.push({
        text: segment.text,
        type: 'shot',
        color: segment.shotColor,
        shotId: segment.shotId,
        segmentId: segment.id,
        key: `shot-${segment.id}`
      });

      lastIndex = segment.endIndex;
    });

    // Add remaining text
    if (lastIndex < editorContent.length) {
      result.push({
        text: editorContent.substring(lastIndex),
        type: 'normal',
        key: 'normal-end'
      });
    }

    return result;
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <div className="flex-1">
                <CardTitle className="text-lg text-gray-900 mb-1">
                  {title}
                </CardTitle>
                {!collapsed && (
                  <p className="text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {!collapsed && (
          <CardContent className="space-y-4">
            <div className="relative">
              {/* Hidden textarea for editing */}
              <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={editorContent}
                onChange={(e) => updateContent(e.target.value)}
                onMouseUp={handleTextSelectionEvent}
                onKeyUp={handleTextSelectionEvent}
                className="min-h-[150px] text-base leading-relaxed resize-none opacity-0 absolute top-0 left-0 w-full h-full z-10"
                style={{
                  direction: 'ltr',
                  textAlign: 'left'
                }}
              />

              {/* Visual overlay with highlighting */}
              <div 
                className="min-h-[150px] text-base leading-relaxed p-3 border rounded-md bg-white relative z-0"
                style={{
                  direction: 'ltr',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {editorContent ? (
                  renderHighlightedText().map((segment) => (
                    <span
                      key={segment.key}
                      className={`${segment.type === 'shot' ? 'px-1 rounded' : ''}`}
                      style={{
                        backgroundColor: segment.type === 'shot' ? `${segment.color}30` : 'transparent',
                        borderBottom: segment.type === 'shot' ? `2px solid ${segment.color}` : 'none',
                        textDecoration: segment.type === 'shot' && segment.isStrikethrough ? 'line-through' : 'none'
                      }}
                      onClick={() => {
                        if (segment.type === 'shot') {
                          toggleTextStrikethrough(segment.segmentId);
                        }
                      }}
                    >
                      {segment.text}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">{placeholder}</span>
                )}
              </div>

              {/* Shot Selector */}
              {showShotSelector && selectedText && (
                <div className="absolute top-full mt-2 left-0 z-20">
                  <ShotSelector
                    selectedText={selectedText}
                    existingShots={shots}
                    onCreateShot={handleCreateShot}
                    onAssignToShot={handleAssignToShot}
                    onClose={() => setShowShotSelector(false)}
                  />
                </div>
              )}
            </div>

            {/* Shot Display */}
            <ShotDisplay shots={shots} onToggleStrikethrough={toggleTextStrikethrough} />
          </CardContent>
        )}
      </Card>

      {/* Creative Zone - only show if enabled */}
      {showCreativeZone && (
        <CreativeZone
          items={creativeItems}
          onAddItem={addCreativeItem}
          onRemoveItem={removeCreativeItem}
        />
      )}
    </div>
  );
};
