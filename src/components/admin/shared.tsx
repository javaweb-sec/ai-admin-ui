import { useState, type ReactNode } from "react";
import {
  Bell,
  Megaphone,
  Info,
  CircleCheck,
  TriangleAlert,
  Wrench,
  Sparkles,
  Gift,
  UserRound,
  Shield,
  Code,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
export const iconOptions = {
  Bell,
  Megaphone,
  Info,
  CircleCheck,
  TriangleAlert,
  Wrench,
  Sparkles,
  Gift,
  UserRound,
  Shield,
  Code,
  Smile,
};
const iconLabels = [
  "铃铛",
  "公告",
  "信息",
  "完成",
  "警告",
  "维护",
  "更新",
  "礼物",
  "用户",
  "盾牌",
  "代码",
  "笑脸",
];
export function AppIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconOptions[name as keyof typeof iconOptions] || Bell;
  return <Icon className={className} />;
}
export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label="选择图标" className="flex flex-wrap gap-2">
      {Object.keys(iconOptions).map((name, i) => (
        <Button
          type="button"
          key={name}
          size="icon"
          variant={value === name ? "default" : "outline"}
          aria-label={iconLabels[i]}
          title={iconLabels[i]}
          aria-pressed={value === name}
          onClick={() => onChange(name)}
        >
          <AppIcon name={name} />
        </Button>
      ))}
    </div>
  );
}
export function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
export function Heading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
export function act(action: () => void, message: string) {
  try {
    action();
    toast.success(message);
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "操作失败");
    return false;
  }
}
export function Confirm({
  label,
  title,
  description,
  onConfirm,
  destructive = false,
}: {
  label: string;
  title: string;
  description: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={destructive ? "text-destructive dark:text-red-400" : ""}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="p-12 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
