import SidebarNavigation from "./SidebarNavigation";
import { useNavigationStore } from "@/stores/navigationStore";
import { useAdminStore } from "@/stores/adminStore";
import { AppIcon } from "@/components/admin/shared";
import NotificationCenter from "@/components/admin/NotificationCenter";
import { Suspense, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import GradientBackground from "@/components/GradientBackground";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/contexts/ThemeContext";
import { appConfig } from "@/config/app";
import { menuItems } from "@/config/menu";
import { cn } from "@/lib/utils";
export default function AdminLayout() {
  const { collapsed, toggleSidebar } = useNavigationStore();
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();
  const profile = useAdminStore((s) => s.profile);
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const currentPage = menuItems.find((item) => item.path === location.pathname);
  const isArticleEditor =
    location.pathname === "/article/new" ||
    location.pathname.startsWith("/article/edit/");
  const title = isArticleEditor
    ? location.pathname === "/article/new"
      ? "新增文章"
      : "编辑文章"
    : currentPage?.label || "页面未找到";
  const PageIcon =
    (isArticleEditor
      ? menuItems.find((item) => item.path === "/article/list")?.icon
      : currentPage?.icon) || LayoutDashboard;
  const navigation = (compact: boolean, inDrawer = false) => (
    <div className="admin-navigation flex h-full flex-col bg-background border-r border-border">
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 px-4",
          compact ? "flex-col py-5" : "h-20",
        )}
      >
        <img src="/favicon.svg" alt="" className="h-9 w-9 shrink-0" />
        {!compact && (
          <div>
            <strong className="text-lg">{appConfig.name}</strong>
            <p className="text-xs text-muted-foreground">管理控制台</p>
          </div>
        )}
        {!inDrawer && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 shrink-0", !compact && "ml-auto")}
            aria-label={compact ? "展开菜单" : "折叠菜单"}
            title={compact ? "展开菜单" : "折叠菜单"}
            aria-expanded={!compact}
            onClick={toggleSidebar}
          >
            {compact ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        )}
      </div>
      <SidebarNavigation compact={compact} onNavigate={() => setOpen(false)} />
      {!compact && (
        <div className="m-4 rounded-xl border bg-muted/40 p-4 text-xs leading-6 text-muted-foreground">
          通用后台模板
          <br />
          本地演示 · 自由扩展
        </div>
      )}
    </div>
  );
  return (
    <div className="h-dvh overflow-hidden">
      <GradientBackground>
        <div className="flex h-full">
          <aside
            className={cn(
              "hidden shrink-0 transition-[width] md:block",
              collapsed ? "w-20" : "w-64",
            )}
          >
            {navigation(collapsed)}
          </aside>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">主导航</SheetTitle>
              <SheetDescription className="sr-only">
                选择后台页面
              </SheetDescription>
              {navigation(false, true)}
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="admin-header flex h-20 shrink-0 items-center justify-between gap-3 bg-transparent px-4 md:px-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="打开菜单"
                  onClick={() => setOpen(true)}
                >
                  <Menu />
                </Button>
                <PageIcon
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {isArticleEditor
                    ? "文章管理"
                    : currentPage?.group || "工作空间"}{" "}
                  / <span className="text-foreground">{title}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="切换主题"
                  onClick={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                >
                  {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                </Button>
                <NotificationCenter />
                <Button asChild variant="ghost" className="gap-2 px-2">
                  <Link to="/profile" aria-label="个人资料">
                    <AppIcon name={profile.avatar} />
                    <span className="hidden max-w-24 truncate sm:inline">
                      {profile.displayName}
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="退出登录"
                  onClick={logout}
                >
                  <LogOut />
                </Button>
              </div>
            </header>
            <main className="admin-main min-h-0 flex-1 overflow-auto bg-muted/30 p-4 md:p-8">
              <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
                <Suspense fallback={null}>
                  <Outlet />
                </Suspense>
              </div>
            </main>
          </div>
        </div>
      </GradientBackground>
    </div>
  );
}
