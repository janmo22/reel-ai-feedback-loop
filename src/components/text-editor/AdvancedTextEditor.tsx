
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Camera, MessageSquare } from 'lucide-react';
import { Shot, TextSegment, useAdvancedEditor, PRESET_COLORS } from '@/hooks/use-advanced-editor';
import { useSectionShots } from '@/hooks/use-section-shots';
import { ShotSelector } from './ShotSelector';
import { SingleShotDisplay } from './SingleShotDisplay';
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
  sectionId: string;
  showSaveButton?: boolean;
  videoContextId?: string;
}

export const AdvancedTextEditor: React.FC<AdvancedTextEditorProps> = ({
  title,
  description,
  placeholder,
  content,
  onContentChange,
  showCreativeZone = true,
  hideEmptyShots = false,
  sectionId,
  showSaveButton = true,
  videoContextId = 'default'
}) => {
  const {
    selectedText,
    selectionRange,
    creativeItems,
    textareaRef,
    handleTextSelection,
    addCreativeItem,
    removeCreativeItem,
    getShotForText,
    toggleTextStrikethrough,
    addSegmentComment,
    updateSegmentComment,
    removeSegmentComment
  } = useAdvancedEditor(content, videoContextId);

  // Use section-specific shots
  const { shots: sectionShots, addShotToSection, removeShotFromSection, updateShot, clearSectionShots } = useSectionShots(sectionId, videoContextId);

  const [showShotSelector, setShowShotSelector] = useState(false);

  // Clear shots when content is empty and hideEmptyShots is true
  useEffect(() => {
    if (hideEmptyShots && content.trim() === '' && sectionShots.length > 0) {
      clearSectionShots();
    }
  }, [content, hideEmptyShots, sectionShots.length, clearSectionShots]);

  const handleContentChange = useCallback((newContent: string) => {
    onContentChange(newContent);
  }, [onContentChange]);

  const createNewShot = useCallback((name: string, color: string) => {
    if (!selectedText || !selectionRange) return null;

    const start = selectionRange.start;
    const end = selectionRange.end - 1;

    console.log('🎬 Creando nueva toma para sección:', sectionId, { name, selectedText, start, end });

    const newShot: Shot = {
      id: `shot-${sectionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      textSegments: []
    };

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: selectedText,
      shotId: newShot.id,
      startIndex: start,
      endIndex: end,
      isStrikethrough: false,
      comments: []
    };

    newShot.textSegments.push(newSegment);
    
    console.log('✅ Toma creada exitosamente para sección:', sectionId, { id: newShot.id, name });
    
    addShotToSection(newShot);
    setShowShotSelector(false);
    
    return newShot;
  }, [selectedText, selectionRange, sectionId, addShotToSection]);

  const assignToExistingShot = useCallback((shotId: string) => {
    if (!selectedText || !selectionRange) return;

    const start = selectionRange.start;
    const end = selectionRange.end - 1;

    const newSegment: TextSegment = {
      id: `segment-${Date.now()}`,
      text: selectedText,
      shotId,
      startIndex: start,
      endIndex: end,
      isStrikethrough: false,
      comments: []
    };

    const shotToUpdate = sectionShots.find(shot => shot.id === shotId);
    if (shotToUpdate) {
      updateShot(shotId, {
        textSegments: [...shotToUpdate.textSegments, newSegment]
      });
    }

    setShowShotSelector(false);
  }, [selectedText, selectionRange, sectionShots, updateShot]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('📝 Cambio en textarea:', e.target.value.length, 'caracteres');
    handleContentChange(e.target.value);
  };

  // Get character styling based on shots
  const getCharacterStyle = useCallback((index: number) => {
    const shot = getShotForText(index);
    if (shot) {
      return {
        backgroundColor: `${shot.color}20`,
        borderBottom: `2px solid ${shot.color}`,
      };
    }
    return {};
  }, [getShotForText]);

  console.log('🎨 AdvancedTextEditor renderizado:', {
    sectionId,
    title,
    contentLength: content.length,
    shotsCount: sectionShots.length
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {title}
              <InfoTooltip content={description} />
            </CardTitle>
            {sectionShots.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Camera className="h-4 w-4 text-flow-blue" />
                <span className="text-sm text-flow-blue font-medium">
                  {sectionShots.length} toma{sectionShots.length !== 1 ? 's' : ''} en esta sección
                </span>
              </div>
            )}
          </div>
          
          {selectedText && (
            <Button
              onClick={() => setShowShotSelector(true)}
              className="bg-flow-blue hover:bg-flow-blue/90"
              size="sm"
            >
              <Camera className="h-4 w-4 mr-2" />
              Crear Toma
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={content}
            onChange={handleTextareaChange}
            onSelect={handleTextSelection}
            className="min-h-[120px] resize-none"
            style={{
              fontFamily: 'monospace',
              lineHeight: '1.5',
            }}
          />
          
          {selectedText && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="bg-flow-blue/10 text-flow-blue">
                "{selectedText}" seleccionado
              </Badge>
            </div>
          )}
        </div>

        {/* Show shots for this section only */}
        {sectionShots.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Tomas de esta sección
            </h4>
            {sectionShots.map((shot) => (
              <SingleShotDisplay
                key={shot.id}
                shot={shot}
                onToggleStrikethrough={toggleTextStrikethrough}
                onAddComment={addSegmentComment}
                onUpdateComment={updateSegmentComment}
                onRemoveComment={removeSegmentComment}
              />
            ))}
          </div>
        )}

        {showCreativeZone && (
          <CreativeZone
            items={creativeItems}
            onAddItem={addCreativeItem}
            onRemoveItem={removeCreativeItem}
            title={`Ideas para ${title}`}
            description="Añade referencias, notas o inspiración específica para esta sección"
          />
        )}
      </CardContent>

      {showShotSelector && (
        <ShotSelector
          selectedText={selectedText}
          existingShots={sectionShots}
          onCreateShot={createNewShot}
          onAssignToShot={assignToExistingShot}
          onClose={() => setShowShotSelector(false)}
        />
      )}
    </Card>
  );
};
