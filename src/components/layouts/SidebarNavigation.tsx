import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, FileText, Settings } from "lucide-react";
import { menuItems } from "@/config/menu";
import { useNavigationStore } from "@/stores/navigationStore";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type MenuItem = (typeof menuItems)[number];
export default function SidebarNavigation({
  compact,
  onNavigate,
}: {
  compact: boolean;
  onNavigate: () => void;
}) {
  const { collapsedGroups, toggleGroup } = useNavigationStore();
  const { pathname } = useLocation();
  const active = (item: MenuItem) =>
    pathname === item.path ||
    (item.path === "/article/list" &&
      (pathname === "/article/new" || pathname.startsWith("/article/edit/")));
  const row =
    "group flex w-full items-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const color = (selected: boolean) =>
    selected
      ? "bg-primary/10 text-primary font-medium dark:bg-primary/15"
      : "text-muted-foreground hover:bg-muted hover:text-foreground";
  const link = (item: MenuItem, child = false) => (
    <NavLink
      key={item.path}
      to={item.path}
      title={item.label}
      onClick={onNavigate}
      className={cn(
        row,
        color(active(item)),
        child
          ? "h-9 gap-2.5 px-3 text-sm"
          : compact
            ? "h-16 flex-col justify-center gap-1 text-[11px]"
            : "h-10 gap-3 px-3 text-sm font-medium",
      )}
    >
      <item.icon
        className={cn(
          "shrink-0 transition-colors group-hover:text-primary",
          child ? "h-4 w-4" : "h-5 w-5",
        )}
      />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
  return (
    <nav
      aria-label="主导航"
      className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-2"
    >
      {menuItems
        .filter((item) => item.group === "工作空间")
        .map((item) => link(item))}
      {[
        ...new Set(
          menuItems
            .filter((item) => item.group !== "工作空间")
            .map((item) => item.group),
        ),
      ].map((group) => {
        const children = menuItems.filter((item) => item.group === group);
        const Icon = group === "文章管理" ? FileText : Settings;
        const selected = children.some(active);
        const expanded = !collapsedGroups[group];
        if (compact)
          return (
            <DropdownMenu key={group}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`${group}子菜单`}
                  title={group}
                  className={cn(
                    row,
                    color(selected),
                    "h-16 flex-col justify-center gap-1 text-[11px] font-medium",
                  )}
                >
                  <Icon className="h-5 w-5 group-hover:text-primary" />
                  <span>{group}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={8}
                className="w-48"
              >
                <DropdownMenuLabel>{group}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {children.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <NavLink
                      to={item.path}
                      onClick={onNavigate}
                      className={cn(
                        "flex h-9 items-center gap-2.5",
                        active(item) && "bg-primary/10 text-primary",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        return (
          <Collapsible
            key={group}
            open={expanded}
            onOpenChange={() => toggleGroup(group)}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-label={`${expanded ? "折叠" : "展开"}${group}`}
                className={cn(
                  row,
                  color(selected),
                  "h-10 gap-3 px-3 text-sm font-medium",
                )}
              >
                <Icon className="h-5 w-5 shrink-0 group-hover:text-primary" />
                <span className="flex-1 text-left">{group}</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    !expanded && "-rotate-90",
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="sidebar-submenu">
              <div className="ml-6 space-y-1 pb-1 pt-1">
                {children.map((item) => link(item, true))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}
