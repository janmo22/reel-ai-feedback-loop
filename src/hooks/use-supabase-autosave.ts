
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
}

// Simplified Shot interface to avoid circular reference
interface SimpleShot {
  id: string;
  name: string;
  color: string;
  textSegments: Array<{
    id: string;
    startIndex: number;
    endIndex: number;
    isStrikethrough?: boolean;
    comments?: Array<{ id: string; text: string }>;
  }>;
}

export const useSupabaseAutosave = (videoContextId: string = 'default') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null
  });

  // Save specific section to Supabase with video context
  const saveSection = useCallback(async (
    sectionId: string,
    content: string,
    sectionShots: SimpleShot[],
    title?: string
  ) => {
    if (!user) return null;

    try {
      const sectionData = {
        user_id: user.id,
        section_id: sectionId,
        video_context_id: videoContextId,
        title: title || 'Sección sin título',
        content,
        shots: JSON.stringify(sectionShots)
      };

      // Check if this section already exists for this video context
      const { data: existingSection, error: fetchError } = await supabase
        .from('section_drafts')
        .select('id')
        .eq('user_id', user.id)
        .eq('section_id', sectionId)
        .eq('video_context_id', videoContextId)
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

      console.log('Sección guardada en Supabase para video context:', videoContextId);
      return true;

    } catch (error: any) {
      console.error('Error guardando sección:', error);
      throw error;
    }
  }, [user, videoContextId]);

  // Save all sections at once
  const saveAllSections = useCallback(async (
    sections: Array<{
      sectionId: string;
      content: string;
      shots: SimpleShot[];
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

  // Load section from Supabase with video context
  const loadSection = useCallback(async (sectionId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('section_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('section_id', sectionId)
        .eq('video_context_id', videoContextId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Parse shots safely - fix the type conversion issue
        let parsedShots: SimpleShot[] = [];
        try {
          if (data.shots) {
            // Convert from unknown to string first, then parse
            const shotsString = typeof data.shots === 'string' ? data.shots : JSON.stringify(data.shots);
            parsedShots = JSON.parse(shotsString) as SimpleShot[];
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
  }, [user, videoContextId]);

  return {
    saveState,
    saveAllSections,
    loadSection
  };
};
