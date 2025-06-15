
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Video, FileText, Target, Users, Calendar, Lightbulb } from 'lucide-react';
import { useContentSeries } from '@/hooks/use-content-series';
import { useUserShots } from '@/hooks/use-user-shots';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ContentSeriesManager: React.FC = () => {
  const { contentSeries, createSeries, updateSeries, deleteSeries } = useContentSeries();
  const { userShots, createShot, deleteShot, updateShot } = useUserShots();
  
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);
  const [isCreatingShot, setIsCreatingShot] = useState(false);
  const [editingShot, setEditingShot] = useState<any>(null);
  
  const [seriesForm, setSeriesForm] = useState({ 
    name: '', 
    description: '', 
    target_audience: '',
    content_pillars: '',
    posting_frequency: '',
    goals: '',
    tone_style: ''
  });
  
  const [shotForm, setShotForm] = useState({ 
    name: '', 
    description: '', 
    color: '#3B82F6' 
  });

  // Color options for shots
  const colorOptions = [
    { value: '#3B82F6', label: 'Azul', color: 'bg-blue-500' },
    { value: '#EF4444', label: 'Rojo', color: 'bg-red-500' },
    { value: '#10B981', label: 'Verde', color: 'bg-green-500' },
    { value: '#F59E0B', label: 'Amarillo', color: 'bg-yellow-500' },
    { value: '#8B5CF6', label: 'Púrpura', color: 'bg-purple-500' },
    { value: '#EC4899', label: 'Rosa', color: 'bg-pink-500' },
    { value: '#6B7280', label: 'Gris', color: 'bg-gray-500' },
    { value: '#F97316', label: 'Naranja', color: 'bg-orange-500' }
  ];

  const resetSeriesForm = () => {
    setSeriesForm({ 
      name: '', 
      description: '', 
      target_audience: '',
      content_pillars: '',
      posting_frequency: '',
      goals: '',
      tone_style: ''
    });
  };

  const resetShotForm = () => {
    setShotForm({ name: '', description: '', color: '#3B82F6' });
  };

  const handleCreateSeries = async () => {
    if (!seriesForm.name.trim()) return;
    
    try {
      await createSeries.mutateAsync(seriesForm);
      resetSeriesForm();
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
      resetSeriesForm();
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
      resetShotForm();
      setIsCreatingShot(false);
    } catch (error) {
      console.error('Error creating shot:', error);
    }
  };

  const handleUpdateShot = async () => {
    if (!editingShot || !shotForm.name.trim()) return;
    
    try {
      await updateShot.mutateAsync({
        id: editingShot.id,
        ...shotForm
      });
      resetShotForm();
      setEditingShot(null);
    } catch (error) {
      console.error('Error updating shot:', error);
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
    setSeriesForm({
      name: series.name,
      description: series.description || '',
      target_audience: series.target_audience || '',
      content_pillars: series.content_pillars || '',
      posting_frequency: series.posting_frequency || '',
      goals: series.goals || '',
      tone_style: series.tone_style || ''
    });
  };

  const startEditingShot = (shot: any) => {
    setEditingShot(shot);
    setShotForm({
      name: shot.name,
      description: shot.description || '',
      color: shot.color || '#3B82F6'
    });
  };

  return (
    <div className="space-y-8">
      {/* Content Series Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="h-6 w-6 text-flow-blue" />
                Content Series Profesionales
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Organiza y planifica tus series de contenido con estrategia detallada
              </p>
            </div>
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
          {contentSeries.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes series de contenido</h3>
              <p className="text-gray-500 mb-4">Crea tu primera serie profesional para organizar estratégicamente tus videos</p>
              <Button onClick={() => setIsCreatingSeries(true)} className="bg-flow-blue hover:bg-flow-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Serie
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {contentSeries.map((series) => (
                <Card key={series.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-flow-blue">{series.name}</CardTitle>
                        {series.description && (
                          <p className="text-sm text-gray-600 mt-1">{series.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
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
                  <CardContent className="space-y-3">
                    {series.target_audience && (
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">Audiencia</p>
                          <p className="text-sm text-gray-600">{series.target_audience}</p>
                        </div>
                      </div>
                    )}
                    {series.content_pillars && (
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">Pilares de Contenido</p>
                          <p className="text-sm text-gray-600">{series.content_pillars}</p>
                        </div>
                      </div>
                    )}
                    {series.posting_frequency && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">Frecuencia</p>
                          <p className="text-sm text-gray-600">{series.posting_frequency}</p>
                        </div>
                      </div>
                    )}
                    {series.goals && (
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">Objetivos</p>
                          <p className="text-sm text-gray-600">{series.goals}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
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
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-6 w-6 text-flow-blue" />
                Biblioteca de Planos Personalizados
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Crea y guarda tus planos favoritos con colores para reutilizarlos rápidamente
              </p>
            </div>
            <Button 
              onClick={() => setIsCreatingShot(true)}
              variant="outline"
              className="border-flow-blue text-flow-blue hover:bg-flow-blue hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plano
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userShots.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes planos personalizados</h3>
              <p className="text-gray-500 mb-4">Crea planos con colores que puedas reutilizar en el editor de videos</p>
              <Button onClick={() => setIsCreatingShot(true)} variant="outline" className="border-flow-blue text-flow-blue">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Plano
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {userShots.map((shot) => (
                <div
                  key={shot.id}
                  className="group p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white"
                  style={{ borderLeftColor: shot.color, borderLeftWidth: '4px' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: shot.color }}
                        />
                        <h4 className="font-medium text-gray-900">{shot.name}</h4>
                      </div>
                      {shot.description && (
                        <p className="text-sm text-gray-600">{shot.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditingShot(shot)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteShot(shot.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Series Modal */}
      <Dialog open={isCreatingSeries || !!editingSeries} onOpenChange={() => {
        setIsCreatingSeries(false);
        setEditingSeries(null);
        resetSeriesForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSeries ? 'Editar Content Series' : 'Nueva Content Series Profesional'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="series-name">Nombre de la Serie *</Label>
                <Input
                  id="series-name"
                  placeholder="Ej: Tips de Productividad"
                  value={seriesForm.name}
                  onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="series-description">Descripción</Label>
                <Textarea
                  id="series-description"
                  placeholder="Describe el enfoque y propósito de esta serie..."
                  value={seriesForm.description}
                  onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="target-audience">Audiencia Objetivo</Label>
                <Input
                  id="target-audience"
                  placeholder="Ej: Profesionales de 25-35 años"
                  value={seriesForm.target_audience}
                  onChange={(e) => setSeriesForm({ ...seriesForm, target_audience: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="posting-frequency">Frecuencia de Publicación</Label>
                <Input
                  id="posting-frequency"
                  placeholder="Ej: 2 videos por semana"
                  value={seriesForm.posting_frequency}
                  onChange={(e) => setSeriesForm({ ...seriesForm, posting_frequency: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="content-pillars">Pilares de Contenido</Label>
                <Textarea
                  id="content-pillars"
                  placeholder="Ej: Productividad, Gestión del tiempo, Herramientas digitales..."
                  value={seriesForm.content_pillars}
                  onChange={(e) => setSeriesForm({ ...seriesForm, content_pillars: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="goals">Objetivos de la Serie</Label>
                <Textarea
                  id="goals"
                  placeholder="Ej: Aumentar engagement, educar a la audiencia, posicionamiento como experto..."
                  value={seriesForm.goals}
                  onChange={(e) => setSeriesForm({ ...seriesForm, goals: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="tone-style">Tono y Estilo</Label>
                <Input
                  id="tone-style"
                  placeholder="Ej: Profesional pero cercano, dinámico, educativo"
                  value={seriesForm.tone_style}
                  onChange={(e) => setSeriesForm({ ...seriesForm, tone_style: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={editingSeries ? handleUpdateSeries : handleCreateSeries}
                className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
                disabled={!seriesForm.name.trim()}
              >
                {editingSeries ? 'Guardar Cambios' : 'Crear Serie'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsCreatingSeries(false);
                  setEditingSeries(null);
                  resetSeriesForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Shot Modal */}
      <Dialog open={isCreatingShot || !!editingShot} onOpenChange={() => {
        setIsCreatingShot(false);
        setEditingShot(null);
        resetShotForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingShot ? 'Editar Plano Personalizado' : 'Nuevo Plano Personalizado'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shot-name">Nombre del Plano *</Label>
              <Input
                id="shot-name"
                placeholder="Ej: Plano picado creativo"
                value={shotForm.name}
                onChange={(e) => setShotForm({ ...shotForm, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="shot-color">Color del Plano</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setShotForm({ ...shotForm, color: option.value })}
                    className={`p-3 rounded-md border-2 transition-all ${
                      shotForm.color === option.value 
                        ? 'border-gray-400 ring-2 ring-offset-2 ring-gray-300' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full mx-auto ${option.color}`} />
                    <p className="text-xs mt-1 text-gray-600">{option.label}</p>
                  </button>
                ))}
              </div>
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
                onClick={editingShot ? handleUpdateShot : handleCreateShot}
                className="flex-1 bg-flow-blue hover:bg-flow-blue/90"
                disabled={!shotForm.name.trim()}
              >
                {editingShot ? 'Guardar Cambios' : 'Crear Plano'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsCreatingShot(false);
                  setEditingShot(null);
                  resetShotForm();
                }}
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
