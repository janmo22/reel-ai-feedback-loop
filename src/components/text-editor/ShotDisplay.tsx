import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, ChevronDown, ChevronUp, Eye, EyeOff, MessageSquare, Film, Plus, Trash2 } from 'lucide-react';
import { Shot } from '@/hooks/use-advanced-editor';

interface ShotDisplayProps {
  shots: Shot[];
  onToggleStrikethrough?: (segmentId: string) => void;
  onAddSegmentComment?: (segmentId: string, comment: string) => void;
  onUpdateSegmentComment?: (segmentId: string, commentId: string, comment: string) => void;
  onRemoveSegmentComment?: (segmentId: string, commentId: string) => void;
}

export const ShotDisplay: React.FC<ShotDisplayProps> = ({ 
  shots, 
  onToggleStrikethrough,
  onAddSegmentComment,
  onUpdateSegmentComment,
  onRemoveSegmentComment
}) => {
  const [expandedShots, setExpandedShots] = useState<Set<string>>(new Set());
  const [shotsVisible, setShotsVisible] = useState(true);
  const [editingComment, setEditingComment] = useState<{ segmentId: string; commentId?: string; isEditing: boolean }>({ segmentId: '', isEditing: false });
  const [commentText, setCommentText] = useState('');

  const toggleShotExpanded = (shotId: string) => {
    setExpandedShots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shotId)) {
        newSet.delete(shotId);
      } else {
        newSet.add(shotId);
      }
      return newSet;
    });
  };

  const handleAddComment = (segmentId: string) => {
    if (commentText.trim() && onAddSegmentComment) {
      onAddSegmentComment(segmentId, commentText.trim());
      setCommentText('');
      setEditingComment({ segmentId: '', isEditing: false });
    }
  };

  const handleUpdateComment = (segmentId: string, commentId: string) => {
    if (commentText.trim() && onUpdateSegmentComment) {
      onUpdateSegmentComment(segmentId, commentId, commentText.trim());
      setCommentText('');
      setEditingComment({ segmentId: '', isEditing: false });
    }
  };

  const startEditingComment = (segmentId: string, commentId?: string, currentText?: string) => {
    setCommentText(currentText || '');
    setEditingComment({ segmentId, commentId, isEditing: true });
  };

  const cancelEditing = () => {
    setCommentText('');
    setEditingComment({ segmentId: '', isEditing: false });
  };

  if (shots.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Film className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Selecciona texto para crear tomas</p>
        <p className="text-xs mt-1">Organiza tu guión por escenas y planos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with toggle */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-800">
            Tomas del Guión
          </h3>
          <Badge variant="secondary" className="text-xs">
            {shots.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShotsVisible(!shotsVisible)}
          className="text-xs h-7"
        >
          {shotsVisible ? (
            <>
              <EyeOff className="h-3 w-3 mr-1" />
              Ocultar
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mr-1" />
              Mostrar
            </>
          )}
        </Button>
      </div>

      {/* Shots list */}
      {shotsVisible && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {shots.map((shot) => (
            <Card 
              key={shot.id} 
              className="border-l-3 shadow-sm hover:shadow-md transition-shadow"
              style={{ borderLeftColor: shot.color }}
            >
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: shot.color }}
                    />
                    <span className="font-medium">{shot.name}</span>
                    <Badge variant="outline" className="text-xs h-5">
                      {shot.textSegments.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleShotExpanded(shot.id)}
                    className="h-6 w-6 p-0"
                  >
                    {expandedShots.has(shot.id) ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0 pb-3">
                {/* Preview text (always visible) */}
                <div className="mb-2">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {shot.textSegments.map(s => s.text).join(' ').slice(0, 120)}...
                  </p>
                </div>

                {/* Expanded content */}
                {expandedShots.has(shot.id) && (
                  <div className="space-y-2 border-t pt-2">
                    {/* Text segments */}
                    {shot.textSegments.map((segment) => (
                      <div key={segment.id} className="space-y-1">
                        <div
                          className="flex items-start justify-between gap-2 text-xs p-2 rounded bg-gray-50 border-l-2"
                          style={{ borderLeftColor: shot.color }}
                        >
                          <div 
                            className={`flex-1 ${segment.isStrikethrough ? 'line-through opacity-60' : ''}`}
                          >
                            "{segment.text}"
                          </div>
                          <div className="flex gap-1 mt-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingComment(segment.id)}
                              className="h-5 w-5 p-0 text-gray-400 hover:text-blue-600"
                              title="Añadir comentario"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            {onToggleStrikethrough && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleStrikethrough(segment.id)}
                                className={`h-5 w-5 p-0 ${
                                  segment.isStrikethrough 
                                    ? 'text-green-600 hover:text-green-700' 
                                    : 'text-gray-400 hover:text-red-600'
                                }`}
                                title={segment.isStrikethrough ? 'Restaurar' : 'Marcar como usado'}
                              >
                                {segment.isStrikethrough ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Existing comments display */}
                        {segment.comments && segment.comments.length > 0 && (
                          <div className="ml-2 space-y-1">
                            {segment.comments.map((comment) => (
                              <div key={comment.id} className="p-2 bg-blue-50 rounded text-xs border-l-2 border-blue-200">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="text-blue-700">{comment.text}</p>
                                    <p className="text-blue-500 text-xs mt-1">
                                      {new Date(comment.timestamp).toLocaleTimeString()}
                                    </p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditingComment(segment.id, comment.id, comment.text)}
                                      className="h-4 w-4 p-0 text-blue-400 hover:text-blue-600"
                                      title="Editar comentario"
                                    >
                                      <MessageSquare className="h-2.5 w-2.5" />
                                    </Button>
                                    {onRemoveSegmentComment && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveSegmentComment(segment.id, comment.id)}
                                        className="h-4 w-4 p-0 text-red-400 hover:text-red-600"
                                        title="Eliminar comentario"
                                      >
                                        <Trash2 className="h-2.5 w-2.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment editing form */}
                        {editingComment.segmentId === segment.id && editingComment.isEditing && (
                          <div className="ml-2 p-2 bg-blue-50 rounded text-xs border">
                            <Textarea
                              placeholder="Escribe tu comentario aquí..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              rows={2}
                              className="text-xs mb-2"
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (editingComment.commentId) {
                                    handleUpdateComment(segment.id, editingComment.commentId);
                                  } else {
                                    handleAddComment(segment.id);
                                  }
                                }}
                                className="h-6 text-xs px-2"
                              >
                                {editingComment.commentId ? 'Actualizar' : 'Añadir'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEditing}
                                className="h-6 text-xs px-2"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
