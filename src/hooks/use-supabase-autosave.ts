
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shot, CreativeItem } from './use-advanced-editor';
import { Section } from './use-simple-editor';

interface SaveState {
  draftId: string | null;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const useSupabaseAutosave = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saveState, setSaveState] = useState<SaveState>({
    draftId: null,
    lastSaved: null,
    isSaving: false,
    hasUnsavedChanges: false
  });

  // Track changes to detect unsaved content
  const markAsChanged = useCallback(() => {
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  // Save specific section to Supabase
  const saveSection = useCallback(async (
    sectionId: string,
    content: string,
    sectionShots: Shot[],
    title?: string
  ) => {
    if (!user) return null;

    try {
      setSaveState(prev => ({ ...prev, isSaving: true }));

      const sectionData = {
        user_id: user.id,
        section_id: sectionId,
        title: title || 'Sección sin título',
        content,
        shots: JSON.stringify(sectionShots)
      };

      // Check if this section already exists
      const { data: existingSection, error: fetchError } = await supabase
        .from('section_drafts')
        .select('id')
        .eq('user_id', user.id)
        .eq('section_id', sectionId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingSection) {
        // Update existing section
        const { error } = await supabase
          .from('section_drafts')
          .update({
            content,
            shots: JSON.stringify(sectionShots),
            title: title || 'Sección sin título'
          })
          .eq('id', existingSection.id);

        if (error) throw error;
      } else {
        // Create new section
        const { data, error } = await supabase
          .from('section_drafts')
          .insert(sectionData)
          .select('id')
          .single();

        if (error) throw error;
      }

      const now = new Date();
      setSaveState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: now,
        hasUnsavedChanges: false
      }));

      console.log('Sección guardada en Supabase');
      return true;

    } catch (error: any) {
      console.error('Error guardando sección:', error);
      setSaveState(prev => ({ ...prev, isSaving: false }));
      
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la sección. Intenta de nuevo.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Manual save function
  const manualSave = useCallback(async (
    sectionId: string,
    content: string,
    sectionShots: Shot[],
    title?: string
  ) => {
    const result = await saveSection(sectionId, content, sectionShots, title);
    if (result) {
      toast({
        title: "Guardado completado",
        description: "La sección ha sido guardada correctamente.",
      });
    }
    return result;
  }, [saveSection, toast]);

  // Load section from Supabase
  const loadSection = useCallback(async (sectionId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('section_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('section_id', sectionId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSaveState(prev => ({
          ...prev,
          lastSaved: new Date(data.updated_at)
        }));

        return {
          id: data.id,
          title: data.title,
          content: data.content || '',
          shots: JSON.parse(data.shots || '[]')
        };
      }
    } catch (error) {
      console.error('Error cargando sección:', error);
    }
    return null;
  }, [user]);

  // Helper function to safely parse JSON with fallback
  const safeJsonParse = (jsonString: any, fallback: any) => {
    try {
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      }
      if (jsonString && typeof jsonString === 'object') {
        return jsonString;
      }
      return fallback;
    } catch (error) {
      console.warn('Error parsing JSON:', error);
      return fallback;
    }
  };

  return {
    saveState,
    markAsChanged,
    manualSave,
    loadSection,
    safeJsonParse
  };
};
