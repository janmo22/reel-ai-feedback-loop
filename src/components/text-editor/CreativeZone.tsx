
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Image, Video, Link, Plus, X, Upload, Grip } from 'lucide-react';
import { CreativeItem } from '@/hooks/use-advanced-editor';

interface CreativeZoneProps {
  items: CreativeItem[];
  onAddItem: (type: CreativeItem['type'], content: string, url?: string, file?: File) => void;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleAdd = () => {
    if (content.trim()) {
      onAddItem(activeType, content.trim(), url.trim() || undefined, selectedFile || undefined);
      setContent('');
      setUrl('');
      setSelectedFile(null);
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {title}
          {items.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {items.length}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new item */}
        {!showAddForm ? (
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveType('note');
                setShowAddForm(true);
              }}
              className="h-8 text-xs"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Nota
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveType('image');
                setShowAddForm(true);
              }}
              className="h-8 text-xs"
            >
              <Image className="h-3 w-3 mr-1" />
              Imagen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveType('video');
                setShowAddForm(true);
              }}
              className="h-8 text-xs"
            >
              <Video className="h-3 w-3 mr-1" />
              Video
            </Button>
          </div>
        ) : (
          <Card className="bg-gray-50 border">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center gap-2">
                {getIcon(activeType)}
                <span className="font-medium text-sm">
                  {activeType === 'note' ? 'Nueva nota' : 
                   activeType === 'image' ? 'Nueva imagen' : 
                   'Nuevo video'}
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
                rows={2}
                className="text-xs"
              />

              {activeType === 'image' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Subir imagen:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="text-xs"
                    />
                    {selectedFile && (
                      <p className="text-xs text-green-600">
                        Archivo seleccionado: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <Input
                    placeholder="O URL de referencia"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-xs"
                  />
                </>
              )}

              {activeType === 'video' && (
                <Input
                  placeholder="URL del video de referencia"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="text-xs"
                />
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={!content.trim()} className="h-6 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setContent('');
                    setUrl('');
                    setSelectedFile(null);
                  }}
                  className="h-6 text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display items in mood board style */}
        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((item) => (
              <Card key={item.id} className="border relative group">
                <CardContent className="p-2">
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 mb-1">
                      {getIcon(item.type)}
                      <Badge className={`text-xs ${getBadgeColor(item.type)}`}>
                        {item.type === 'note' ? 'Nota' :
                         item.type === 'image' ? 'Imagen' : 'Video'}
                      </Badge>
                    </div>
                    
                    {item.file && item.type === 'image' && (
                      <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                        <img
                          src={URL.createObjectURL(item.file)}
                          alt="Uploaded reference"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-700 line-clamp-3">{item.content}</p>
                    
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !showAddForm && (
          <div className="text-center py-6 text-gray-500">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">Tu zona creativa está vacía</p>
            <p className="text-xs text-gray-400">Agrega notas, imágenes o referencias de video</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
