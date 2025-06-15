
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shot } from './use-advanced-editor';

interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
}

export const useSupabaseAutosave = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null
  });

  // Save specific section to Supabase
  const saveSection = useCallback(async (
    sectionId: string,
    content: string,
    sectionShots: Shot[],
    title?: string
  ) => {
    if (!user) return null;

    try {
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

      console.log('Sección guardada en Supabase');
      return true;

    } catch (error: any) {
      console.error('Error guardando sección:', error);
      throw error;
    }
  }, [user]);

  // Save all sections at once
  const saveAllSections = useCallback(async (
    sections: Array<{
      sectionId: string;
      content: string;
      shots: Shot[];
      title: string;
    }>
  ) => {
    if (!user || sections.length === 0) return false;

    try {
      setSaveState(prev => ({ ...prev, isSaving: true }));

      // Save all sections sequentially
      for (const section of sections) {
        await saveSection(section.sectionId, section.content, section.shots, section.title);
      }

      const now = new Date();
      setSaveState({
        isSaving: false,
        lastSaved: now
      });

      toast({
        title: "Guardado completado",
        description: "Todas las secciones han sido guardadas correctamente.",
      });

      return true;

    } catch (error: any) {
      console.error('Error guardando secciones:', error);
      setSaveState(prev => ({ ...prev, isSaving: false }));
      
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el contenido. Intenta de nuevo.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, saveSection, toast]);

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
        // Fix the type error by properly handling the JSON parsing
        let parsedShots: Shot[] = [];
        try {
          if (data.shots && typeof data.shots === 'string') {
            parsedShots = JSON.parse(data.shots);
          } else if (Array.isArray(data.shots)) {
            // Properly cast from Json[] to Shot[] using unknown first
            parsedShots = data.shots as unknown as Shot[];
          }
        } catch (parseError) {
          console.warn('Error parsing shots JSON:', parseError);
          parsedShots = [];
        }

        return {
          id: data.id,
          title: data.title || 'Sección sin título',
          content: data.content || '',
          shots: parsedShots
        };
      }
    } catch (error) {
      console.error('Error cargando sección:', error);
    }
    return null;
  }, [user]);

  return {
    saveState,
    saveAllSections,
    loadSection
  };
};
