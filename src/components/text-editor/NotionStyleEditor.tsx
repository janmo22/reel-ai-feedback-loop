
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  Heading1, 
  Heading2, 
  List, 
  Plus, 
  Trash2, 
  FileText,
  Save,
  Eye
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface Section {
  id: string;
  type: 'hook' | 'buildup' | 'value' | 'cta';
  title: string;
  content: string;
  order: number;
}

interface NotionStyleEditorProps {
  onContentChange: (content: string) => void;
  initialContent?: string;
}

const sectionTypes = [
  { value: 'hook', label: 'Hook (Ruptura de patrón)', icon: Type },
  { value: 'buildup', label: 'Build-up', icon: Heading1 },
  { value: 'value', label: 'Aporte de valor', icon: Heading2 },
  { value: 'cta', label: 'Call to action', icon: List },
];

const NotionStyleEditor: React.FC<NotionStyleEditorProps> = ({ 
  onContentChange,
  initialContent = ''
}) => {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [scriptTitle, setScriptTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const lastContentRef = useRef<string>('');

  // Initialize with empty state
  useEffect(() => {
    if (!initialContent || initialContent === lastContentRef.current) return;
    
    // Only set initial content if it's different and not empty
    if (initialContent.trim() && initialContent !== lastContentRef.current) {
      // Parse initial content if provided
      try {
        const parsedSections = parseContentToSections(initialContent);
        setSections(parsedSections);
        lastContentRef.current = initialContent;
      } catch (error) {
        console.log('Could not parse initial content, starting fresh');
        setSections([]);
      }
    }
  }, [initialContent]);

  // Update parent component when content changes
  useEffect(() => {
    const fullContent = sections.map(section => 
      `## ${section.title}\n${section.content}`
    ).join('\n\n');
    
    if (fullContent !== lastContentRef.current) {
      lastContentRef.current = fullContent;
      onContentChange(fullContent);
    }
  }, [sections, onContentChange]);

  const parseContentToSections = (content: string): Section[] => {
    // Simple parsing logic - split by ## headers
    const parts = content.split(/^## /gm).filter(Boolean);
    return parts.map((part, index) => {
      const lines = part.split('\n');
      const title = lines[0] || `Sección ${index + 1}`;
      const sectionContent = lines.slice(1).join('\n').trim();
      
      return {
        id: `section-${Date.now()}-${index}`,
        type: 'value' as const,
        title,
        content: sectionContent,
        order: index
      };
    });
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: 'hook',
      title: 'Nueva Sección',
      content: '',
      order: sections.length
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(prev => 
      prev.map(section => 
        section.id === id ? { ...section, ...updates } : section
      )
    );
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id));
  };

  const getSectionTypeInfo = (type: string) => {
    return sectionTypes.find(t => t.value === type) || sectionTypes[0];
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-flow-blue" />
            <span>Guión del Video</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addSection}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Sección
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Comienza a escribir tu guión</p>
            <p className="text-sm">Agrega secciones para estructurar tu contenido</p>
            <Button
              onClick={addSection}
              className="mt-4 bg-flow-blue hover:bg-flow-blue/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Sección
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => {
              const typeInfo = getSectionTypeInfo(section.type);
              const Icon = typeInfo.icon;
              
              return (
                <Card key={section.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-flow-blue" />
                        <div className="flex-1">
                          <Input
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="font-medium border-none p-0 h-auto focus-visible:ring-0"
                            placeholder="Título de la sección"
                          />
                        </div>
                        <Badge variant="secondary" className="bg-flow-blue/10 text-flow-blue">
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={section.type}
                          onValueChange={(value) => updateSection(section.id, { type: value as Section['type'] })}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sectionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSection(section.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      placeholder={`Escribe el contenido para ${typeInfo.label.toLowerCase()}...`}
                      className="min-h-[120px] border-none p-0 focus-visible:ring-0 resize-none"
                      rows={6}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotionStyleEditor;
