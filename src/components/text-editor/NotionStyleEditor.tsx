
import React from 'react';
import NewTextEditor from './NewTextEditor';

interface NotionStyleEditorProps {
  placeholder?: string;
  onContentChange?: (content: string) => void;
}

const NotionStyleEditor: React.FC<NotionStyleEditorProps> = ({ 
  onContentChange 
}) => {
  return (
    <div className="space-y-6">
      <NewTextEditor onContentChange={onContentChange} />
    </div>
  );
};

export default NotionStyleEditor;
