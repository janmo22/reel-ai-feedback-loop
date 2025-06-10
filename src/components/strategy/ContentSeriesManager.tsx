
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Video, FileText } from 'lucide-react';
import { useContentSeries } from '@/hooks/use-content-series';
import { useUserShots } from '@/hooks/use-user-shots';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ContentSeriesManager: React.FC = () => {
  const { contentSeries, createSeries, updateSeries, deleteSeries } = useContentSeries();
  const { userShots, createShot, deleteShot } = useUserShots();
  
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);
  const [isCreatingShot, setIsCreatingShot] = useState(false);
  
  const [seriesForm, setSeriesForm] = useState({ name: '', description: '' });
  const [shotForm, setShotForm] = useState({ name: '', description: '' });

  const handleCreateSeries = async () => {
    if (!seriesForm.name.trim()) return;
    
    try {
      await createSeries.mutateAsync(seriesForm);
      setSeriesForm({ name: '', description: '' });
      setIsCreatingSeries(false);
    } catch (error) {
      console.error('Error creating series:', error);
    }
  };

  const handleUpdateSeries = async () => {
    if (!editingSeries || !seriesForm.name.trim()) return;
    
    try {
      await updateSeries.mutateAsync({
        id: editingSeries.id,
        ...seriesForm
      });
      setSeriesForm({ name: '', description: '' });
      setEditingSeries(null);
    } catch (error) {
      console.error('Error updating series:', error);
    }
  };

  const handleDeleteSeries = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta serie?')) {
      try {
        await deleteSeries.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting series:', error);
      }
    }
  };

  const handleCreateShot = async () => {
    if (!shotForm.name.trim()) return;
    
    try {
      await createShot.mutateAsync(shotForm);
      setShotForm({ name: '', description: '' });
      setIsCreatingShot(false);
    } catch (error) {
      console.error('Error creating shot:', error);
    }
  };

  const handleDeleteShot = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este plano?')) {
      try {
        await deleteShot.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting shot:', error);
      }
    }
  };

  const startEditingSeries = (series: any) => {
    setEditingSeries(series);
    setSeriesForm({ name: series.name, description: series.description || '' });
  };

  return (
    <div className="space-y-8">
      {/* Content Series Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-flow-blue" />
              Content Series
            </CardTitle>
            <Button 
              onClick={() => setIsCreatingSeries(true)}
              className="bg-flow-blue hover:bg-flow-blue/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Serie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Organiza tus videos en series temáticas para mantener consistencia y planificación estratégica.
          </p>
          
          {contentSeries.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No tienes series de contenido</p>
              <p className="text-sm text-gray-400">Crea tu primera serie para organizar tus videos</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {contentSeries.map((series) => (
                <Card key={series.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{series.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => startEditingSeries(series)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteSeries(series.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {series.description && (
                    <CardContent>
                      <p className="text-sm text-gray-600">{series.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Shots Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-flow-blue" />
              Planos Personalizados
            </CardTitle>
            <Button 
              onClick={() => setIsCreatingShot(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plano
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Crea y guarda tus planos favoritos para reutilizarlos rápidamente en tus videos.
          </p>
          
          {userShots.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No tienes planos personalizados</p>
              <p className="text-sm text-gray-400">Crea planos que puedas reutilizar en tus videos</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userShots.map((shot) => (
                <Badge
                  key={shot.id}
                  variant="secondary"
                  className="text-sm py-2 px-3 bg-gray-100 hover:bg-gray-200 transition-colors group cursor-pointer"
                >
                  <span>{shot.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteShot(shot.id)}
                    className="h-4 w-4 ml-2 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Series Modal */}
      <Dialog open={isCreatingSeries} onOpenChange={setIsCreatingSeries}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Content Series</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="series-name">Nombre</Label>
              <Input
                id="series-name"
                placeholder="Ej: Tips de Productividad"
                value={seriesForm.name}
                onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="series-description">Descripción (Opcional)</Label>
              <Textarea
                id="series-description"
                placeholder="Describe el enfoque de esta serie..."
                value={seriesForm.description}
                onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateSeries}
                className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
                disabled={!seriesForm.name.trim()}
              >
                Crear Serie
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsCreatingSeries(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Series Modal */}
      <Dialog open={!!editingSeries} onOpenChange={() => setEditingSeries(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Content Series</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-series-name">Nombre</Label>
              <Input
                id="edit-series-name"
                value={seriesForm.name}
                onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-series-description">Descripción (Opcional)</Label>
              <Textarea
                id="edit-series-description"
                value={seriesForm.description}
                onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdateSeries}
                className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
                disabled={!seriesForm.name.trim()}
              >
                Guardar Cambios
              </Button>
              <Button 
                variant="outline"
                onClick={() => setEditingSeries(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Shot Modal */}
      <Dialog open={isCreatingShot} onOpenChange={setIsCreatingShot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Plano Personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shot-name">Nombre del Plano</Label>
              <Input
                id="shot-name"
                placeholder="Ej: Plano picado creativo"
                value={shotForm.name}
                onChange={(e) => setShotForm({ ...shotForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="shot-description">Descripción (Opcional)</Label>
              <Textarea
                id="shot-description"
                placeholder="Describe cómo y cuándo usar este plano..."
                value={shotForm.description}
                onChange={(e) => setShotForm({ ...shotForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateShot}
                className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
                disabled={!shotForm.name.trim()}
              >
                Crear Plano
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsCreatingShot(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentSeriesManager;
