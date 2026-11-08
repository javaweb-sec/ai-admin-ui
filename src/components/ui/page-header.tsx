import React from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

const PageHeader = ({
  title,
  description,
  icon: Icon,
  children,
}: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-border dark:border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center space-x-3">{children}</div>
      )}
    </div>
  );
};

export default PageHeader;
