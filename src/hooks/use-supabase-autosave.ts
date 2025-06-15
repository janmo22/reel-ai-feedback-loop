
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shot, CreativeItem } from './use-advanced-editor';
import { Section } from './use-simple-editor';

interface AutosaveState {
  draftId: string | null;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const useSupabaseAutosave = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [autosaveState, setAutosaveState] = useState<AutosaveState>({
    draftId: null,
    lastSaved: null,
    isSaving: false,
    hasUnsavedChanges: false
  });

  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Save to Supabase
  const saveToSupabase = useCallback(async (
    content: string,
    editorMode: 'structured' | 'free',
    sections: Section[],
    shots: Shot[],
    creativeItems: CreativeItem[],
    title?: string
  ) => {
    if (!user) return null;

    try {
      setAutosaveState(prev => ({ ...prev, isSaving: true }));

      const draftData = {
        user_id: user.id,
        title: title || 'Guión sin título',
        content,
        editor_mode: editorMode,
        sections: JSON.stringify(sections),
        shots: JSON.stringify(shots),
        creative_items: JSON.stringify(creativeItems)
      };

      // If we have an existing draft, update it; otherwise create new
      if (autosaveState.draftId) {
        const { error } = await supabase
          .from('script_drafts')
          .update(draftData)
          .eq('id', autosaveState.draftId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('script_drafts')
          .insert(draftData)
          .select('id')
          .single();

        if (error) throw error;
        
        setAutosaveState(prev => ({ ...prev, draftId: data.id }));
      }

      const now = new Date();
      setAutosaveState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: now,
        hasUnsavedChanges: false
      }));

      console.log('Autoguardado en Supabase realizado');
      return autosaveState.draftId;

    } catch (error: any) {
      console.error('Error en autoguardado:', error);
      setAutosaveState(prev => ({ ...prev, isSaving: false }));
      
      toast({
        title: "Error de autoguardado",
        description: "No se pudo guardar automáticamente. Intenta guardar manualmente.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, autosaveState.draftId, toast]);

  // Manual save function
  const manualSave = useCallback(async (
    content: string,
    editorMode: 'structured' | 'free',
    sections: Section[],
    shots: Shot[],
    creativeItems: CreativeItem[],
    title?: string
  ) => {
    const result = await saveToSupabase(content, editorMode, sections, shots, creativeItems, title);
    if (result !== null) {
      toast({
        title: "Guardado manual completado",
        description: "Tu guión ha sido guardado correctamente.",
      });
    }
    return result;
  }, [saveToSupabase, toast]);

  // Auto save with debouncing
  const scheduleAutosave = useCallback((
    content: string,
    editorMode: 'structured' | 'free',
    sections: Section[],
    shots: Shot[],
    creativeItems: CreativeItem[],
    title?: string
  ) => {
    // Check if data has actually changed
    const currentData = JSON.stringify({ content, editorMode, sections, shots, creativeItems });
    if (currentData === lastSavedDataRef.current) return;

    lastSavedDataRef.current = currentData;
    setAutosaveState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // Set new timeout for autosave (save after 3 seconds of inactivity)
    autosaveTimeoutRef.current = setTimeout(() => {
      saveToSupabase(content, editorMode, sections, shots, creativeItems, title);
    }, 3000);
  }, [saveToSupabase]);

  // Load from Supabase
  const loadFromSupabase = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('script_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAutosaveState(prev => ({
          ...prev,
          draftId: data.id,
          lastSaved: new Date(data.updated_at)
        }));

        return {
          id: data.id,
          title: data.title,
          content: data.content || '',
          editorMode: data.editor_mode as 'structured' | 'free',
          sections: JSON.parse(data.sections || '[]'),
          shots: JSON.parse(data.shots || '[]'),
          creativeItems: JSON.parse(data.creative_items || '[]')
        };
      }
    } catch (error) {
      console.error('Error cargando desde Supabase:', error);
    }
    return null;
  }, [user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    autosaveState,
    scheduleAutosave,
    manualSave,
    loadFromSupabase
  };
};
