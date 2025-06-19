
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
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
    sectionShots: any[],
    title?: string
  ) => {
    if (!user) return null;

    try {
      console.log('Guardando sección:', sectionId, 'para video context:', videoContextId);
      
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

      if (fetchError) {
        console.error('Error al buscar sección existente:', fetchError);
        throw fetchError;
      }

      if (existingSection) {
        // Update existing section
        const { error } = await supabase
          .from('section_drafts')
          .update({
            content,
            shots: JSON.stringify(sectionShots),
            title: title || 'Sección sin título',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSection.id);

        if (error) {
          console.error('Error al actualizar sección:', error);
          throw error;
        }
        console.log('Sección actualizada correctamente');
      } else {
        // Create new section
        const { data, error } = await supabase
          .from('section_drafts')
          .insert(sectionData)
          .select('id')
          .single();

        if (error) {
          console.error('Error al crear sección:', error);
          throw error;
        }
        console.log('Nueva sección creada:', data?.id);
      }

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
      shots: any[];
      title: string;
    }>
  ) => {
    if (!user || sections.length === 0) {
      console.log('No hay usuario o secciones para guardar');
      return false;
    }

    try {
      setSaveState(prev => ({ ...prev, isSaving: true }));
      console.log('Iniciando guardado de', sections.length, 'secciones para video context:', videoContextId);

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

      console.log('Guardado completado exitosamente');
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
  }, [user, saveSection, toast, videoContextId]);

  // Load section from Supabase with video context
  const loadSection = useCallback(async (sectionId: string) => {
    if (!user) return null;

    try {
      console.log('Cargando sección:', sectionId, 'para video context:', videoContextId);
      
      const { data, error } = await supabase
        .from('section_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('section_id', sectionId)
        .eq('video_context_id', videoContextId)
        .maybeSingle();

      if (error) {
        console.error('Error al cargar sección:', error);
        throw error;
      }

      if (data) {
        // Parse shots safely
        let parsedShots: any[] = [];
        try {
          if (data.shots) {
            const shotsData = typeof data.shots === 'string' 
              ? JSON.parse(data.shots) 
              : data.shots;
            
            if (Array.isArray(shotsData)) {
              parsedShots = shotsData;
            }
          }
        } catch (parseError) {
          console.warn('Error parsing shots JSON:', parseError);
          parsedShots = [];
        }

        console.log('Sección cargada correctamente:', data.title);
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
