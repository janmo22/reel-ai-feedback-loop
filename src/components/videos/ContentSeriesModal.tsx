
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target } from 'lucide-react';
import { useContentSeries } from '@/hooks/use-content-series';

interface ContentSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSeries: (seriesId: string | null) => void;
}

const ContentSeriesModal: React.FC<ContentSeriesModalProps> = ({
  isOpen,
  onClose,
  onSelectSeries
}) => {
  const { contentSeries, createSeries } = useContentSeries();
  const [selectedSeries, setSelectedSeries] = useState<string>('no-series');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');

  const handleSelectSeries = () => {
    console.log('handleSelectSeries called with selectedSeries:', selectedSeries);
    onSelectSeries(selectedSeries === 'no-series' ? null : selectedSeries);
    onClose();
  };

  const handleCreateNewSeries = async () => {
    if (!newSeriesName.trim()) return;
    
    try {
      console.log('Creating new series:', { name: newSeriesName, description: newSeriesDescription });
      await createSeries.mutateAsync({
        name: newSeriesName,
        description: newSeriesDescription
      });
      setNewSeriesName('');
      setNewSeriesDescription('');
      setShowCreateNew(false);
    } catch (error) {
      console.error('Error creating series:', error);
    }
  };

  const handleSeriesChange = (value: string) => {
    console.log('Series selection changed to:', value);
    setSelectedSeries(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-flow-blue" />
            Content Series
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Este video forma parte de alguna serie de contenido?
          </p>
          
          {!showCreateNew ? (
            <>
              <div>
                <Label htmlFor="series-select">Seleccionar Serie</Label>
                <Select value={selectedSeries} onValueChange={handleSeriesChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sin serie específica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-series">Sin serie</SelectItem>
                    {contentSeries && contentSeries.length > 0 && contentSeries.map((series) => {
                      // Ensure series.id is not empty and is a valid string
                      if (!series.id || series.id.trim() === '') {
                        console.warn('Skipping series with empty ID:', series);
                        return null;
                      }
                      
                      console.log('Rendering series option:', series);
                      return (
                        <SelectItem key={series.id} value={series.id}>
                          {series.name || 'Sin nombre'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setShowCreateNew(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Nueva Serie
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-series-name">Nombre de la Serie</Label>
                <Input
                  id="new-series-name"
                  placeholder="Ej: Tips de Productividad"
                  value={newSeriesName}
                  onChange={(e) => setNewSeriesName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="new-series-description">Descripción (Opcional)</Label>
                <Textarea
                  id="new-series-description"
                  placeholder="Describe el enfoque de esta serie..."
                  value={newSeriesDescription}
                  onChange={(e) => setNewSeriesDescription(e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateNewSeries}
                  className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
                  disabled={!newSeriesName.trim()}
                >
                  Crear Serie
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCreateNew(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
          
          {!showCreateNew && (
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSelectSeries} className="flex-1 bg-flow-blue hover:bg-flow-blue/90">
                Continuar
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentSeriesModal;
