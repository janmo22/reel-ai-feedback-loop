
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
}

export const AdvancedTextEditor: React.FC<AdvancedTextEditorProps> = ({
  title,
  description,
  placeholder,
  content,
  onContentChange
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
    removeCreativeItem
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
              <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                value={editorContent}
                onChange={(e) => updateContent(e.target.value)}
                onMouseUp={handleTextSelectionEvent}
                onKeyUp={handleTextSelectionEvent}
                className="min-h-[150px] text-base leading-relaxed resize-none"
                style={{
                  direction: 'ltr',
                  textAlign: 'left'
                }}
              />

              {/* Shot Selector */}
              {showShotSelector && selectedText && (
                <div className="absolute top-full mt-2 left-0 z-10">
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
            <ShotDisplay shots={shots} />
          </CardContent>
        )}
      </Card>

      {/* Creative Zone */}
      <CreativeZone
        items={creativeItems}
        onAddItem={addCreativeItem}
        onRemoveItem={removeCreativeItem}
      />
    </div>
  );
};
