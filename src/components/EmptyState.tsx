
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionIcon,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
      {icon && <div className="mb-4">{icon}</div>}
      <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
      <div className="text-muted-foreground mb-6">{description}</div>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" className="flex items-center gap-1">
          {actionIcon}
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
