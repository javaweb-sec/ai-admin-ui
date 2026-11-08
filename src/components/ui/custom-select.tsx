import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";

interface CustomSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
  disabled?: boolean;
}

const CustomSelect = ({
  value,
  onValueChange,
  placeholder = "Please Select",
  options,
  className = "",
  size = "md",
  variant = "default",
  disabled = false,
}: CustomSelectProps) => {
  const { currentTheme } = useTheme();

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 text-sm px-3";
      case "lg":
        return "h-12 text-lg px-4";
      default:
        return "h-10 text-sm px-4";
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "ghost":
        return "bg-transparent border-transparent hover:bg-muted/50 focus:bg-muted/50";
      case "outline":
        return "bg-card/50 border-border/50 hover:bg-card/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20";
      default:
        return "bg-muted/30 border-border/50 hover:bg-muted/50 focus:border-primary/50";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={`
            ${getSizeClasses()}
            ${getVariantClasses()}
            text-foreground
            hover:bg-accent/15
            focus:ring-1
            focus:ring-primary/50
            focus:border-primary/60
            transition-all
            duration-200
            rounded-xl
            border
            focus:outline-none
            backdrop-blur-md
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <SelectValue placeholder={placeholder} className="text-foreground" />
        </SelectTrigger>
        <SelectContent
          className="bg-card/95 backdrop-blur-xl border border-border/50 text-card-foreground shadow-xl rounded-xl z-[9999]"
          position="popper"
          sideOffset={4}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-card-foreground hover:bg-muted/80 focus:bg-muted/80 cursor-pointer rounded-lg data-[highlighted]:bg-muted/80 transition-colors duration-200"
            >
              <span className="text-sm">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomSelect;
