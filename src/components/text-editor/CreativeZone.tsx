
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Image, Video, Link, Plus, X, Upload } from 'lucide-react';
import { CreativeItem } from '@/hooks/use-advanced-editor';

interface CreativeZoneProps {
  items: CreativeItem[];
  onAddItem: (type: CreativeItem['type'], content: string, url?: string) => void;
  onRemoveItem: (id: string) => void;
  title?: string;
  description?: string;
}

export const CreativeZone: React.FC<CreativeZoneProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  title = "Zona Creativa",
  description = "Guarda ideas, referencias e inspiración para tu video"
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeType, setActiveType] = useState<CreativeItem['type']>('note');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = () => {
    if (content.trim()) {
      onAddItem(activeType, content.trim(), url.trim() || undefined);
      setContent('');
      setUrl('');
      setShowAddForm(false);
    }
  };

  const getIcon = (type: CreativeItem['type']) => {
    switch (type) {
      case 'note':
        return <Lightbulb className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
    }
  };

  const getBadgeColor = (type: CreativeItem['type']) => {
    switch (type) {
      case 'note':
        return 'bg-yellow-100 text-yellow-800';
      case 'image':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {title}
          <Badge variant="secondary" className="text-xs">
            {items.length} {items.length === 1 ? 'elemento' : 'elementos'}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new item */}
        {!showAddForm ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveType('note');
                setShowAddForm(true);
              }}
              className="flex-1"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Nota
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveType('image');
                setShowAddForm(true);
              }}
              className="flex-1"
            >
              <Image className="h-4 w-4 mr-1" />
              Imagen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveType('video');
                setShowAddForm(true);
              }}
              className="flex-1"
            >
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
          </div>
        ) : (
          <Card className="bg-gray-50 border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                {getIcon(activeType)}
                <span className="font-medium text-sm">
                  {activeType === 'note' ? 'Nueva nota' : 
                   activeType === 'image' ? 'Nueva referencia de imagen' : 
                   'Nueva referencia de video'}
                </span>
              </div>

              <Textarea
                placeholder={
                  activeType === 'note' ? 'Escribe tu idea...' :
                  activeType === 'image' ? 'Describe la imagen o estilo visual...' :
                  'Describe el estilo o concepto del video...'
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
              />

              {(activeType === 'image' || activeType === 'video') && (
                <Input
                  placeholder="URL de referencia (opcional)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={!content.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setContent('');
                    setUrl('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display items */}
        {items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="border">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getIcon(item.type)}
                        <Badge className={`text-xs ${getBadgeColor(item.type)}`}>
                          {item.type === 'note' ? 'Nota' :
                           item.type === 'image' ? 'Imagen' : 'Video'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Link className="h-3 w-3" />
                          Ver referencia
                        </a>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {items.length === 0 && !showAddForm && (
          <div className="text-center py-6 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aún no hay elementos en tu zona creativa</p>
            <p className="text-xs">Agrega notas, referencias visuales o ideas para tu video</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
