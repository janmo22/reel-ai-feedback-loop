
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Upload, Link, StickyNote, X, ExternalLink } from 'lucide-react';
import { Inspiration } from '@/hooks/use-text-editor';

interface CreativeZoneProps {
  inspirations: Inspiration[];
  onAddInspiration: (inspiration: Omit<Inspiration, 'id'>) => void;
}

const CreativeZone: React.FC<CreativeZoneProps> = ({
  inspirations,
  onAddInspiration
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickText, setQuickText] = useState('');

  const handleQuickAdd = () => {
    if (!quickText.trim()) return;

    // Detect if it's a URL
    const isUrl = /^https?:\/\//.test(quickText.trim());
    
    onAddInspiration({
      title: isUrl ? 'Video de referencia' : quickText.trim().substring(0, 50) + (quickText.trim().length > 50 ? '...' : ''),
      notes: isUrl ? '' : quickText.trim(),
      url: isUrl ? quickText.trim() : undefined,
      type: isUrl ? 'video' : 'note'
    });

    setQuickText('');
    setShowQuickAdd(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    
    onAddInspiration({
      title: `Imagen - ${file.name.split('.')[0]}`,
      notes: '',
      imageUrl,
      imageFile: file,
      type: 'image'
    });

    // Reset the input
    e.target.value = '';
  };

  const handleUrlAdd = () => {
    const url = prompt('Introduce la URL del video:');
    if (!url?.trim()) return;

    onAddInspiration({
      title: 'Video de referencia',
      notes: '',
      url: url.trim(),
      type: 'video'
    });
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Zona Creativa
        </CardTitle>
        <p className="text-sm text-gray-600">
          Captura ideas, videos inspiradores, capturas de pantalla y todo lo que te motive
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickAdd(true)}
            className="border-dashed text-gray-600 hover:text-gray-900 hover:bg-white/80"
          >
            <StickyNote className="h-4 w-4 mr-1" />
            Idea rápida
          </Button>
          
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="border-dashed text-gray-600 hover:text-gray-900 hover:bg-white/80"
              type="button"
            >
              <Upload className="h-4 w-4 mr-1" />
              Subir imagen
            </Button>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={handleUrlAdd}
            className="border-dashed text-gray-600 hover:text-gray-900 hover:bg-white/80"
          >
            <Link className="h-4 w-4 mr-1" />
            Video URL
          </Button>
        </div>

        {/* Quick Add Form */}
        {showQuickAdd && (
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="space-y-3">
              <Textarea
                placeholder="Escribe tu idea o pega una URL..."
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                className="min-h-[80px] text-sm border-white/30 bg-white/50"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleQuickAdd}
                  disabled={!quickText.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowQuickAdd(false);
                    setQuickText('');
                  }}
                  className="border-white/30 bg-white/50"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Inspirations Grid */}
        {inspirations.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inspirations.map((inspiration) => (
              <div
                key={inspiration.id}
                className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/80 transition-all"
              >
                {/* Image */}
                {inspiration.imageUrl && (
                  <img 
                    src={inspiration.imageUrl} 
                    alt={inspiration.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                
                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                      {inspiration.title}
                    </h4>
                    {inspiration.type === 'video' && inspiration.url && (
                      <a
                        href={inspiration.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  
                  {inspiration.notes && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {inspiration.notes}
                    </p>
                  )}
                  
                  {inspiration.timestamp && (
                    <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
                      {inspiration.timestamp}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <div className="text-lg font-medium mb-2">Tu zona creativa está vacía</div>
            <div className="text-sm text-gray-400">
              Comienza agregando ideas, videos inspiradores o capturas de pantalla
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreativeZone;
