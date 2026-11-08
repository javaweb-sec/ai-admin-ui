import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  title: string;
  description?: string;
  value?: string | number;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "highlight" | "warning" | "success";
}

const InfoCard = ({
  title,
  description,
  value,
  icon: Icon,
  className,
  children,
  variant = "default",
}: InfoCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "highlight":
        return "border-border dark:border-white/10 bg-card/50";
      case "warning":
        return "border-yellow-500/50 bg-yellow-500/5";
      case "success":
        return "border-green-500/50 bg-green-500/5";
      default:
        return "";
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        getVariantStyles(),
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-muted/50 border border-border dark:border-white/10">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {title}
              </CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {value && (
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{value}</div>
            </div>
          )}
        </div>
      </CardHeader>
      {children && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
};

export default InfoCard;
