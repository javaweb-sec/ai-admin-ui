import React, { lazy, Suspense, useMemo, useState } from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { Check, ChevronDown, Search, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * 图标名称（kebab-case，如 "folder-open"），与 lucide-react 官方命名一致。
 */
type IconName = keyof typeof dynamicIconImports;

const ALL_ICON_NAMES = Object.keys(dynamicIconImports) as IconName[];

/**
 * Lazy 组件缓存：避免每次重新渲染时重建懒加载组件，从而实现一次加载长期复用。
 */
const iconCache = new Map<
  string,
  React.LazyExoticComponent<
    React.ComponentType<{ className?: string; size?: number }>
  >
>();

function getLazyIcon(name: string) {
  if (!iconCache.has(name)) {
    const importer = dynamicIconImports[name as IconName];
    if (!importer) return null;
    iconCache.set(
      name,
      lazy(
        importer as () => Promise<{
          default: React.ComponentType<{ className?: string; size?: number }>;
        }>,
      ),
    );
  }
  return iconCache.get(name)!;
}

/**
 * 根据 lucide 图标名称（kebab-case）动态渲染图标。
 *
 * 示例：
 * ```tsx
 * <DynamicLucideIcon name="folder-open" className="h-4 w-4" />
 * ```
 *
 * 未命中或无效名称时回退到 HelpCircle。
 */
export const DynamicLucideIcon: React.FC<{
  name?: string | null;
  className?: string;
  size?: number;
  fallback?: React.ReactNode;
}> = ({ name, className, size, fallback }) => {
  if (!name)
    return <>{fallback ?? <HelpCircle className={className} size={size} />}</>;
  const Lazy = getLazyIcon(name);
  if (!Lazy)
    return <>{fallback ?? <HelpCircle className={className} size={size} />}</>;
  return (
    <Suspense
      fallback={
        <span
          className={cn("inline-block", className)}
          style={{ width: size, height: size }}
        />
      }
    >
      <Lazy className={className} size={size} />
    </Suspense>
  );
};

/**
 * Lucide 图标选择器属性。
 */
export interface LucideIconPickerProps {
  /** 当前选中图标名称（kebab-case） */
  value?: string;
  /** 选中变更回调 */
  onChange?: (value: string) => void;
  /** 触发器占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 网格中最多展示数量（默认 200，避免一次渲染过多） */
  maxResults?: number;
  /** 触发按钮自定义 className */
  className?: string;
}

/**
 * Lucide 图标选择器：弹出气泡 + 搜索框 + 图标网格。
 *
 * 特性：
 * - 基于 lucide-react `dynamicIconImports`，按需懒加载，初始 bundle 不会膨胀
 * - 搜索框模糊匹配 kebab-case 名称
 * - 选中后显示图标 + 名称，支持清除
 *
 * 存储格式建议：
 * - 数据库中保存 kebab-case 名称（如 `folder-open`）
 * - 渲染时使用 `<DynamicLucideIcon name={name} />`
 *
 * @author yz
 */
const LucideIconPicker: React.FC<LucideIconPickerProps> = ({
  value,
  onChange,
  placeholder = "选择图标",
  disabled = false,
  maxResults = 200,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  /**
   * 按搜索词过滤图标列表，截断到 maxResults。
   */
  const filteredIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICON_NAMES.slice(0, maxResults);
    return ALL_ICON_NAMES.filter((n) => n.includes(q)).slice(0, maxResults);
  }, [query, maxResults]);

  const handlePick = (name: string) => {
    onChange?.(name);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal h-9", className)}
        >
          <span className="flex items-center gap-2 min-w-0">
            {value ? (
              <>
                <DynamicLucideIcon name={value} className="h-4 w-4 shrink-0" />
                <span className="truncate text-sm">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">
                {placeholder}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            {value && !disabled && (
              <span
                role="button"
                onClick={handleClear}
                className="hover:text-destructive p-0.5 rounded"
                title="清除"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="搜索图标名称（如 folder, user, file）"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredIcons.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              未找到匹配图标
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-1">
              {filteredIcons.map((name) => {
                const selected = value === name;
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => handlePick(name)}
                    title={name}
                    className={cn(
                      "relative flex items-center justify-center h-9 w-9 rounded border border-transparent hover:border-primary hover:bg-accent transition-colors",
                      selected && "border-primary bg-primary/10",
                    )}
                  >
                    <DynamicLucideIcon name={name} className="h-4 w-4" />
                    {selected && (
                      <Check className="absolute top-0 right-0 h-3 w-3 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {!query && filteredIcons.length === maxResults && (
            <div className="text-center text-xs text-muted-foreground mt-2">
              仅显示前 {maxResults} 个，请使用搜索精准查找
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LucideIconPicker;
