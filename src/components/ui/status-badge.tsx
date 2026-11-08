import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status:
    | "installed"
    | "available"
    | "running"
    | "stopped"
    | "error"
    | "pending"
    | "active"
    | "inactive";
  text?: string;
  className?: string;
}

const StatusBadge = ({ status, text, className }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "installed":
      case "running":
      case "active":
        return {
          icon: CheckCircle,
          className: "bg-green-500/20 text-green-400 border-green-500/30",
          text: text || "已安装",
        };
      case "available":
      case "inactive":
        return {
          icon: AlertCircle,
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          text: text || "可用",
        };
      case "stopped":
        return {
          icon: XCircle,
          className: "bg-red-500/20 text-red-400 border-red-500/30",
          text: text || "已停止",
        };
      case "pending":
        return {
          icon: Clock,
          className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          text: text || "处理中",
        };
      case "error":
        return {
          icon: XCircle,
          className: "bg-red-500/20 text-red-400 border-red-500/30",
          text: text || "错误",
        };
      default:
        return {
          icon: AlertCircle,
          className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          text: text || "未知",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 px-2 py-1 text-xs font-medium backdrop-blur-sm border",
        config.className,
        className,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.text}
    </Badge>
  );
};

export default StatusBadge;
