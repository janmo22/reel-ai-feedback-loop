
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

  // Save specific section to Supabase with video context using upsert
  const saveSection = useCallback(async (
    sectionId: string,
    content: string,
    sectionShots: any[],
    title?: string
  ) => {
    if (!user) {
      console.warn('No hay usuario autenticado para guardar');
      return null;
    }

    if (!videoContextId || videoContextId === 'default') {
      console.warn('Video context ID no válido:', videoContextId);
      return null;
    }

    try {
      console.log('Guardando sección:', {
        sectionId,
        videoContextId,
        userId: user.id,
        contentLength: content.length,
        shotsCount: sectionShots.length
      });
      
      const sectionData = {
        user_id: user.id,
        section_id: sectionId,
        video_context_id: videoContextId,
        title: title || 'Sección sin título',
        content: content || '',
        shots: JSON.stringify(sectionShots || []),
        updated_at: new Date().toISOString()
      };

      // Usar upsert (ON CONFLICT) para evitar problemas de duplicados
      const { data, error } = await supabase
        .from('section_drafts')
        .upsert(sectionData, {
          onConflict: 'user_id,section_id,video_context_id',
          ignoreDuplicates: false
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error en upsert de sección:', {
          error,
          sectionData: {
            ...sectionData,
            content: `${content.substring(0, 50)}...`,
            shots: `${sectionShots.length} tomas`
          }
        });
        throw error;
      }

      console.log('Sección guardada exitosamente:', {
        id: data?.id,
        sectionId,
        videoContextId
      });
      
      return true;

    } catch (error: any) {
      console.error('Error guardando sección:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        sectionId,
        videoContextId
      });
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

    if (!videoContextId || videoContextId === 'default') {
      console.error('Video context ID no válido para guardar:', videoContextId);
      toast({
        title: "Error de configuración",
        description: "ID de contexto de video no válido",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSaveState(prev => ({ ...prev, isSaving: true }));
      console.log('Iniciando guardado masivo:', {
        sectionsCount: sections.length,
        videoContextId,
        userId: user.id
      });

      // Save all sections sequentially with better error handling
      const results = [];
      for (const section of sections) {
        try {
          const result = await saveSection(section.sectionId, section.content, section.shots, section.title);
          results.push({ sectionId: section.sectionId, success: result !== null });
        } catch (error) {
          console.error(`Error guardando sección ${section.sectionId}:`, error);
          results.push({ sectionId: section.sectionId, success: false, error });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;

      if (failedCount === 0) {
        const now = new Date();
        setSaveState({
          isSaving: false,
          lastSaved: now
        });

        toast({
          title: "Guardado completado",
          description: `${successCount} secciones guardadas correctamente.`,
        });

        console.log('Guardado completado exitosamente:', {
          successCount,
          videoContextId
        });
        return true;
      } else {
        setSaveState(prev => ({ ...prev, isSaving: false }));
        
        toast({
          title: "Guardado parcial",
          description: `${successCount} secciones guardadas, ${failedCount} fallaron.`,
          variant: "destructive",
        });

        console.warn('Guardado parcial:', { successCount, failedCount, results });
        return false;
      }

    } catch (error: any) {
      console.error('Error en guardado masivo:', error);
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
    if (!user) {
      console.warn('No hay usuario para cargar sección');
      return null;
    }

    if (!videoContextId || videoContextId === 'default') {
      console.warn('Video context ID no válido para cargar:', videoContextId);
      return null;
    }

    try {
      console.log('Cargando sección:', { sectionId, videoContextId, userId: user.id });
      
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

        console.log('Sección cargada correctamente:', {
          id: data.id,
          title: data.title,
          contentLength: data.content?.length || 0,
          shotsCount: parsedShots.length
        });
        
        return {
          id: data.id,
          title: data.title || 'Sección sin título',
          content: data.content || '',
          shots: parsedShots
        };
      } else {
        console.log('No se encontró la sección:', { sectionId, videoContextId });
      }
    } catch (error) {
      console.error('Error cargando sección:', error);
    }
    return null;
  }, [user, videoContextId]);

  // Load all shots for the video context
  const loadAllShots = useCallback(async () => {
    if (!user || !videoContextId || videoContextId === 'default') {
      return [];
    }

    try {
      console.log('Cargando todas las tomas para video context:', videoContextId);
      
      const { data, error } = await supabase
        .from('section_drafts')
        .select('shots')
        .eq('user_id', user.id)
        .eq('video_context_id', videoContextId);

      if (error) {
        console.error('Error cargando tomas:', error);
        return [];
      }

      // Merge all shots from all sections
      const allShots: any[] = [];
      const shotIds = new Set<string>();

      data?.forEach(record => {
        if (record.shots) {
          try {
            const shots = typeof record.shots === 'string' 
              ? JSON.parse(record.shots) 
              : record.shots;
            
            if (Array.isArray(shots)) {
              shots.forEach(shot => {
                if (shot && shot.id && !shotIds.has(shot.id)) {
                  shotIds.add(shot.id);
                  allShots.push(shot);
                }
              });
            }
          } catch (parseError) {
            console.warn('Error parsing shots from section:', parseError);
          }
        }
      });

      console.log('Tomas cargadas desde DB:', allShots.length);
      return allShots;
    } catch (error) {
      console.error('Error cargando todas las tomas:', error);
      return [];
    }
  }, [user, videoContextId]);

  return {
    saveState,
    saveAllSections,
    loadSection,
    loadAllShots
  };
};
