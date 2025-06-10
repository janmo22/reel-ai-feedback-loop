
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Camera } from 'lucide-react';
import { Shot } from '@/hooks/use-text-editor';

interface ShotSelectionMenuProps {
  position: { x: number; y: number };
  shots: Shot[];
  selectedText: string;
  onSelectShot: (shotId: string) => void;
  onAddNewShot: (name: string, color: string) => Shot;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const ShotSelectionMenu: React.FC<ShotSelectionMenuProps> = ({
  position,
  shots,
  selectedText,
  onSelectShot,
  onAddNewShot,
  onClose
}) => {
  const [showNewShotForm, setShowNewShotForm] = useState(false);
  const [newShotName, setNewShotName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAddNewShot = () => {
    if (newShotName.trim()) {
      const newShot = onAddNewShot(newShotName.trim(), selectedColor);
      onSelectShot(newShot.id);
      setNewShotName('');
      setShowNewShotForm(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu */}
      <Card 
        className="fixed z-50 p-4 shadow-xl border-0 bg-white min-w-[280px] max-w-[320px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-600 border-b pb-2">
            <span className="font-medium">Asignar toma a:</span>
            <div className="text-gray-900 mt-1 font-medium bg-gray-50 p-2 rounded text-xs">
              "{selectedText}"
            </div>
          </div>

          {/* Tomas existentes */}
          {shots.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Tomas existentes
              </div>
              {shots.map((shot) => (
                <Button
                  key={shot.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectShot(shot.id)}
                  className="w-full justify-start text-left h-auto p-3 border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: shot.color }}
                    />
                    <span className="text-sm">{shot.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Agregar nueva toma */}
          {!showNewShotForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewShotForm(true)}
              className="w-full justify-start border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva toma
            </Button>
          ) : (
            <div className="space-y-3 border-t pt-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Crear nueva toma
              </div>
              
              <Input
                placeholder="Nombre de la toma"
                value={newShotName}
                onChange={(e) => setNewShotName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewShot()}
                className="h-8 text-sm"
                autoFocus
              />
              
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewShotForm(false)}
                  className="flex-1 h-8 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddNewShot}
                  disabled={!newShotName.trim()}
                  className="flex-1 h-8 text-xs bg-gray-900 hover:bg-gray-800"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Crear
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default ShotSelectionMenu;
