
import React from 'react';
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAction?: () => void;
  actionText?: string;
  actionIcon?: React.ReactNode;
}

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  onAction,
  actionText,
  actionIcon
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border rounded-lg bg-background/50">
      <div className="bg-muted rounded-full p-4 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      {onAction && actionText && (
        <Button 
          onClick={onAction}
          className="bg-flow-electric hover:bg-flow-electric/90"
        >
          {actionIcon}
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
