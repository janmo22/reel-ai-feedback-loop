
import React from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAction?: () => void;
  actionText?: string;
  actionIcon?: React.ReactNode;
  isLoading?: boolean;
}

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  onAction,
  actionText,
  actionIcon,
  isLoading = false
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border rounded-lg bg-background/50">
      <div className="bg-muted rounded-full p-4 mb-6">
        {isLoading ? (
          <Skeleton className="h-6 w-6 rounded-full" />
        ) : (
          icon
        )}
      </div>
      {isLoading ? (
        <>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {description}
          </p>
        </>
      )}
      {onAction && actionText && !isLoading && (
        <Button 
          onClick={onAction}
          className="bg-flow-electric hover:bg-flow-electric/90"
        >
          {actionIcon}
          {actionText}
        </Button>
      )}
      {isLoading && (
        <div className="h-10 w-32 bg-muted/50 rounded-md animate-pulse"></div>
      )}
    </div>
  );
};

export default EmptyState;
