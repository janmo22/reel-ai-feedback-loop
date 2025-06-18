
-- Add video_context_id to section_drafts table to isolate content per video
ALTER TABLE section_drafts 
ADD COLUMN video_context_id text DEFAULT 'default';

-- Create index for better performance
CREATE INDEX idx_section_drafts_video_context ON section_drafts(user_id, video_context_id, section_id);
