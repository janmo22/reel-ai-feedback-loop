
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Plus, ExternalLink, Clock } from 'lucide-react';
import { Inspiration } from '@/hooks/use-text-editor';

interface InspirationManagerProps {
  inspirations: Inspiration[];
  onAddInspiration: (url: string, title: string, notes: string, timestamp?: string) => void;
}

const InspirationManager: React.FC<InspirationManagerProps> = ({
  inspirations,
  onAddInspiration
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    notes: '',
    timestamp: ''
  });

  const handleSubmit = () => {
    if (formData.url.trim() && formData.title.trim()) {
      onAddInspiration(
        formData.url.trim(),
        formData.title.trim(),
        formData.notes.trim(),
        formData.timestamp.trim() || undefined
      );
      setFormData({ url: '', title: '', notes: '', timestamp: '' });
      setShowForm(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Inspiraciones
          </CardTitle>
          
          {!showForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
              className="border-dashed text-gray-600 hover:text-gray-900"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Formulario para nueva inspiración */}
        {showForm && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/30 space-y-3">
            <div className="text-sm font-medium text-gray-700">Nueva inspiración</div>
            
            <Input
              placeholder="URL del video (YouTube, Instagram, etc.)"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              className="text-sm"
            />
            
            <Input
              placeholder="Título descriptivo"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-sm"
            />
            
            <Input
              placeholder="Timestamp (ej: 2:30 o 02:30:15)"
              value={formData.timestamp}
              onChange={(e) => setFormData(prev => ({ ...prev, timestamp: e.target.value }))}
              className="text-sm"
            />
            
            <Textarea
              placeholder="¿Qué te gusta de este video? ¿Qué partes quieres aplicar?"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[80px] text-sm"
            />
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!formData.url.trim() || !formData.title.trim() || !isValidUrl(formData.url)}
                className="bg-gray-900 hover:bg-gray-800 text-xs"
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                Guardar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de inspiraciones */}
        {inspirations.length > 0 ? (
          <div className="space-y-3">
            {inspirations.map((inspiration) => (
              <div
                key={inspiration.id}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50/30 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      {inspiration.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={inspiration.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver video
                      </a>
                      {inspiration.timestamp && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          <Clock className="h-3 w-3 mr-1" />
                          {inspiration.timestamp}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {inspiration.notes && (
                  <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-100 mt-2">
                    {inspiration.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <div className="text-sm">No hay inspiraciones agregadas</div>
              <div className="text-xs text-gray-400 mt-1">
                Agrega videos que te inspiren para tu contenido
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default InspirationManager;
