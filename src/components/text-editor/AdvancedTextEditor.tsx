
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAdvancedEditor } from '@/hooks/use-advanced-editor';
import { ShotSelector } from './ShotSelector';
import { ShotDisplay } from './ShotDisplay';
import { CreativeZone } from './CreativeZone';
import { InfoTooltip } from './InfoTooltip';

interface AdvancedTextEditorProps {
  title: string;
  description: string;
  placeholder: string;
  content: string;
  onContentChange: (content: string) => void;
  showCreativeZone?: boolean;
  hideEmptyShots?: boolean;
}

interface HoveredSegment {
  id: string;
  x: number;
  y: number;
  shotName?: string;
  additionalInfo?: string;
}

export const AdvancedTextEditor: React.FC<AdvancedTextEditorProps> = ({
  title,
  description,
  placeholder,
  content,
  onContentChange,
  showCreativeZone = true,
  hideEmptyShots = false
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showShotSelector, setShowShotSelector] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<HoveredSegment | null>(null);
  
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
    toggleTextStrikethrough,
    addShotInfo,
    updateShotInfo,
    removeShotInfo,
    addSegmentInfo,
    updateSegmentInfo,
    removeSegmentInfo
  } = useAdvancedEditor(content);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync with parent component
  useEffect(() => {
    onContentChange(editorContent);
  }, [editorContent, onContentChange]);

  useEffect(() => {
    updateContent(content);
  }, [content, updateContent]);

  const handleTextSelectionEvent = () => {
    handleTextSelection();
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (start !== end && editorContent.trim().length > 0) {
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

  const handleContentChange = (newContent: string) => {
    updateContent(newContent);
  };

  const syncScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const renderHighlightedContent = () => {
    if (!editorContent) return '';
    
    let renderedContent = '';
    let lastIndex = 0;
    
    // Get all segments sorted by start index
    const allSegments: Array<{
      startIndex: number;
      endIndex: number;
      shotId: string;
      shotColor: string;
      segmentId: string;
      isStrikethrough: boolean;
      shotName: string;
      additionalInfo: string;
    }> = [];
    
    shots.forEach(shot => {
      shot.textSegments.forEach(segment => {
        allSegments.push({
          startIndex: segment.startIndex,
          endIndex: segment.endIndex,
          shotId: shot.id,
          shotColor: shot.color,
          segmentId: segment.id,
          isStrikethrough: segment.isStrikethrough || false,
          shotName: shot.name,
          additionalInfo: segment.additionalInfo || ''
        });
      });
    });
    
    // Sort by start index
    allSegments.sort((a, b) => a.startIndex - b.startIndex);
    
    // Build highlighted content with precise character highlighting
    allSegments.forEach(segment => {
      // Add text before this segment
      if (lastIndex < segment.startIndex) {
        renderedContent += editorContent.slice(lastIndex, segment.startIndex);
      }
      
      // Add highlighted segment with precise character-level highlighting
      const segmentText = editorContent.slice(segment.startIndex, segment.endIndex + 1);
      renderedContent += `<span 
        class="shot-highlight" 
        data-segment-id="${segment.segmentId}"
        style="
          background: linear-gradient(to bottom, ${segment.shotColor}20 0%, ${segment.shotColor}30 100%); 
          border-bottom: 2px solid ${segment.shotColor}; 
          border-radius: 2px; 
          padding: 0px 1px; 
          margin: 0; 
          display: inline;
          line-height: inherit;
          ${segment.isStrikethrough ? 'text-decoration: line-through; opacity: 0.6;' : ''}
        "
        onmouseenter="this.dispatchEvent(new CustomEvent('segment-hover', { detail: { segmentId: '${segment.segmentId}', shotName: '${segment.shotName}', additionalInfo: '${segment.additionalInfo}' } }))"
        onmouseleave="this.dispatchEvent(new CustomEvent('segment-leave'))"
      >${segmentText}</span>`;
      
      lastIndex = segment.endIndex + 1;
    });
    
    // Add remaining text
    if (lastIndex < editorContent.length) {
      renderedContent += editorContent.slice(lastIndex);
    }
    
    return renderedContent;
  };

  // Add event listeners for segment hover
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleSegmentHover = (e: CustomEvent) => {
      const rect = overlay.getBoundingClientRect();
      setHoveredSegment({
        id: e.detail.segmentId,
        x: rect.left + rect.width / 2,
        y: rect.top,
        shotName: e.detail.shotName,
        additionalInfo: e.detail.additionalInfo
      });
    };

    const handleSegmentLeave = () => {
      setHoveredSegment(null);
    };

    overlay.addEventListener('segment-hover', handleSegmentHover);
    overlay.addEventListener('segment-leave', handleSegmentLeave);

    return () => {
      overlay.removeEventListener('segment-hover', handleSegmentHover);
      overlay.removeEventListener('segment-leave', handleSegmentLeave);
    };
  }, []);

  // Check if should show shots
  const shouldShowShots = !hideEmptyShots || (editorContent.trim().length > 0 && shots.length > 0);

  return (
    <div className="space-y-4">
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
              {/* Editor container */}
              <div className="relative border rounded-md overflow-hidden bg-white shadow-sm">
                {/* Background highlighting layer */}
                <div 
                  ref={overlayRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-auto"
                  style={{
                    padding: '12px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    color: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                  dangerouslySetInnerHTML={{ __html: renderHighlightedContent() }}
                />
                
                {/* Editable textarea */}
                <Textarea
                  ref={textareaRef}
                  placeholder={placeholder}
                  value={editorContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onMouseUp={handleTextSelectionEvent}
                  onKeyUp={handleTextSelectionEvent}
                  onScroll={syncScroll}
                  className="min-h-[150px] text-base leading-relaxed resize-none border-0 bg-transparent relative z-10 focus:ring-0 focus:border-0 focus:outline-0"
                  style={{
                    direction: 'ltr',
                    textAlign: 'left',
                    background: 'transparent',
                    color: '#1f2937',
                    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    lineHeight: '1.6',
                    padding: '12px',
                    caretColor: '#1f2937'
                  }}
                />
              </div>

              {/* Shot Selector - only show if there's content */}
              {showShotSelector && selectedText && editorContent.trim().length > 0 && (
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

            {/* Shot Display - only show if should show shots */}
            {shouldShowShots && (
              <ShotDisplay 
                shots={shots} 
                onToggleStrikethrough={toggleTextStrikethrough}
                onAddShotInfo={addShotInfo}
                onUpdateShotInfo={updateShotInfo}
                onRemoveShotInfo={removeShotInfo}
                onAddSegmentInfo={addSegmentInfo}
                onUpdateSegmentInfo={updateSegmentInfo}
                onRemoveSegmentInfo={removeSegmentInfo}
              />
            )}
          </CardContent>
        )}
      </Card>

      {/* Tooltip for segment info */}
      {hoveredSegment && (
        <InfoTooltip
          segmentId={hoveredSegment.id}
          x={hoveredSegment.x}
          y={hoveredSegment.y}
          shotName={hoveredSegment.shotName}
          additionalInfo={hoveredSegment.additionalInfo}
        />
      )}

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
