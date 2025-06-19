
-- Eliminar la constraint única incorrecta que no incluye video_context_id
ALTER TABLE section_drafts DROP CONSTRAINT IF EXISTS section_drafts_user_id_section_id_key;

-- Eliminar registros duplicados manteniendo solo el más reciente por combinación
DELETE FROM section_drafts 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, section_id, video_context_id) id
    FROM section_drafts 
    ORDER BY user_id, section_id, video_context_id, updated_at DESC
);

-- Crear la constraint única correcta que incluye video_context_id
ALTER TABLE section_drafts 
ADD CONSTRAINT section_drafts_user_id_section_id_video_context_unique 
UNIQUE (user_id, section_id, video_context_id);

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_section_drafts_context_lookup 
ON section_drafts(user_id, video_context_id);
