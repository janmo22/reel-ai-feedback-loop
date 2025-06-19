
-- Add video_context_id column to section_drafts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'section_drafts' AND column_name = 'video_context_id') THEN
        ALTER TABLE section_drafts ADD COLUMN video_context_id text DEFAULT 'default';
    END IF;
END $$;

-- Create index for better performance on video context queries
DROP INDEX IF EXISTS idx_section_drafts_video_context;
CREATE INDEX idx_section_drafts_video_context ON section_drafts(user_id, video_context_id, section_id);

-- Update any existing records to have a proper video_context_id if they have the default value
UPDATE section_drafts 
SET video_context_id = 'legacy-' || id::text 
WHERE video_context_id = 'default' OR video_context_id IS NULL;
