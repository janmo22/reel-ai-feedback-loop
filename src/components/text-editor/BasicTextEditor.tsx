
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

interface Shot {
  id: string;
  name: string;
  color: string;
}

interface BasicTextEditorProps {
  title: string;
  description: string;
  placeholder: string;
  content: string;
  shots: Shot[];
  onContentChange: (content: string) => void;
  onAddShot: (name: string, color: string) => Shot;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899'  // Pink
];

const BasicTextEditor: React.FC<BasicTextEditorProps> = ({
  title,
  description,
  placeholder,
  content,
  shots,
  onContentChange,
  onAddShot
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showShotForm, setShowShotForm] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [newShotName, setNewShotName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      setShowShotForm(true);
    }
  };

  const handleAddShot = () => {
    if (newShotName.trim()) {
      onAddShot(newShotName.trim(), selectedColor);
      setNewShotName('');
      setShowShotForm(false);
      setSelectedText('');
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900 mb-1">
                {title}
              </CardTitle>
              {!collapsed && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              onMouseUp={handleTextSelection}
              onKeyUp={handleTextSelection}
              className="min-h-[120px] text-base leading-relaxed resize-none"
              style={{
                direction: 'ltr',
                textAlign: 'left'
              }}
            />
          </div>

          {/* Shot selection form */}
          {showShotForm && selectedText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div className="text-sm">
                <span className="font-medium">Texto seleccionado:</span>
                <div className="bg-white p-2 rounded border mt-1 text-xs">
                  "{selectedText}"
                </div>
              </div>

              <Input
                placeholder="Nombre de la toma"
                value={newShotName}
                onChange={(e) => setNewShotName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddShot()}
                className="text-sm"
              />

              <div className="flex gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddShot}
                  disabled={!newShotName.trim()}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Crear Toma
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowShotForm(false);
                    setSelectedText('');
                    setNewShotName('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de tomas creadas */}
          {shots.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                Tomas creadas:
              </div>
              {shots.map((shot) => (
                <div key={shot.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: shot.color }}
                  />
                  <span className="text-sm">{shot.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default BasicTextEditor;
