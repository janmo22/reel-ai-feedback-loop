import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Check, X } from 'lucide-react';
import { Shot, PRESET_COLORS } from '@/hooks/use-advanced-editor';

interface ShotSelectorProps {
  selectedText: string;
  existingShots: Shot[];
  onCreateShot: (name: string, color: string) => void;
  onAssignToShot: (shotId: string) => void;
  onClose: () => void;
}

export const ShotSelector: React.FC<ShotSelectorProps> = ({
  selectedText,
  existingShots,
  onCreateShot,
  onAssignToShot,
  onClose
}) => {
  const [showNewShotForm, setShowNewShotForm] = useState(false);
  const [newShotName, setNewShotName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleCreateShot = () => {
    if (newShotName.trim()) {
      onCreateShot(newShotName.trim(), selectedColor);
      setNewShotName('');
      setShowNewShotForm(false);
    }
  };

  return (
    <Card className="absolute z-10 w-80 border shadow-lg bg-white">
      <CardContent className="p-4 space-y-3">
        <div className="text-sm">
          <span className="font-medium">Texto seleccionado:</span>
          <div className="bg-gray-50 p-2 rounded border mt-1 text-xs max-h-16 overflow-y-auto">
            "{selectedText}"
          </div>
        </div>

        {/* Existing shots */}
        {existingShots.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Asignar a toma existente:</div>
            {existingShots.map((shot) => (
              <Button
                key={shot.id}
                variant="outline"
                size="sm"
                onClick={() => onAssignToShot(shot.id)}
                className="w-full justify-start"
              >
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: shot.color }}
                />
                {shot.name}
              </Button>
            ))}
          </div>
        )}

        {/* Create new shot */}
        <div className="border-t pt-3">
          {!showNewShotForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewShotForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Crear nueva toma
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Nombre de la toma"
                value={newShotName}
                onChange={(e) => setNewShotName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateShot()}
                className="text-sm"
                autoFocus
              />

              <div className="flex gap-1 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      selectedColor === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateShot}
                  disabled={!newShotName.trim()}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Crear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewShotForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-full"
        >
          <X className="h-4 w-4 mr-1" />
          Cerrar
        </Button>
      </CardContent>
    </Card>
  );
};
