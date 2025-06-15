
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  className = "flex items-center gap-2 text-gray-600 hover:text-gray-900",
  children = "Volver"
}) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className={className}
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Button>
  );
};

export default BackButton;
