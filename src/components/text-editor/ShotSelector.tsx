import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Camera, Plus, Palette } from 'lucide-react';
import { useUserShots } from '@/hooks/use-user-shots';

interface Shot {
  id: string;
  name: string;
  color: string;
  textSegments: any[];
}

interface ShotSelectorProps {
  selectedText: string;
  existingShots: Shot[];
  onCreateShot: (name: string, color: string) => void;
  onAssignToShot: (shotId: string) => void;
  onClose: () => void;
}

const predefinedShots = [
  { name: 'Plano General', color: '#3B82F6' },
  { name: 'Plano Medio', color: '#10B981' },
  { name: 'Primer Plano', color: '#F59E0B' },
  { name: 'Plano Detalle', color: '#EF4444' },
  { name: 'Plano Picado', color: '#8B5CF6' },
  { name: 'Plano Contrapicado', color: '#EC4899' },
  { name: 'Plano Cenital', color: '#6B7280' },
  { name: 'Plano Subjetivo', color: '#F97316' }
];

const colorOptions = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#6B7280', '#F97316'
];

export const ShotSelector: React.FC<ShotSelectorProps> = ({
  selectedText,
  existingShots,
  onCreateShot,
  onAssignToShot,
  onClose
}) => {
  const { userShots } = useUserShots();
  const [customName, setCustomName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleCreateCustomShot = () => {
    if (customName.trim()) {
      onCreateShot(customName.trim(), selectedColor);
      setCustomName('');
      setSelectedColor('#3B82F6');
      setShowCustomForm(false);
    }
  };

  const handleQuickCreate = (shotName: string, color: string) => {
    onCreateShot(shotName, color);
  };

  // Combine predefined shots with user's custom shots
  const availableShots = [
    ...predefinedShots,
    ...userShots.map(shot => ({
      name: shot.name,
      color: shot.color || '#3B82F6',
      isCustom: true
    }))
  ];

  return (
    <Card className="w-80 shadow-lg border-2 border-gray-100 bg-white z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Camera className="h-4 w-4 text-flow-blue" />
          Seleccionar Plano
        </CardTitle>
        <p className="text-xs text-gray-500">
          "{selectedText.length > 30 ? selectedText.substring(0, 30) + '...' : selectedText}"
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Existing Shots */}
        {existingShots.length > 0 && (
          <div>
            <Label className="text-xs font-medium text-gray-700">Asignar a plano existente</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {existingShots.map((shot) => (
                <Badge
                  key={shot.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-50 text-xs"
                  style={{ borderColor: shot.color, color: shot.color }}
                  onClick={() => onAssignToShot(shot.id)}
                >
                  {shot.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Shot Creation */}
        <div>
          <Label className="text-xs font-medium text-gray-700">Crear plano rápido</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {availableShots.map((shot, index) => (
              <Button
                key={`${shot.name}-${index}`}
                variant="outline"
                size="sm"
                className="text-xs justify-start h-8 px-2"
                onClick={() => handleQuickCreate(shot.name, shot.color)}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: shot.color }}
                />
                <span className="truncate">{shot.name}</span>
                {shot.isCustom && (
                  <Badge variant="secondary" className="ml-1 text-xs px-1">Tuyo</Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Shot Creation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium text-gray-700">Crear plano personalizado</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="h-6 px-2"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {showCustomForm && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-md">
              <div>
                <Input
                  placeholder="Nombre del plano"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="text-sm h-8"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Color</Label>
                <div className="flex gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-gray-400 ring-2 ring-offset-1 ring-gray-300' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateCustomShot}
                  disabled={!customName.trim()}
                  className="flex-1 text-xs h-7 bg-flow-blue hover:bg-flow-blue/90"
                >
                  Crear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 text-xs h-7"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="w-full text-xs h-8"
        >
          Cerrar
        </Button>
      </CardContent>
    </Card>
  );
};
