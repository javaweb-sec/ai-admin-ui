import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  Users,
  Blocks,
  Settings,
  UserRound,
  KeyRound,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
export const menuItems = [
  {
    path: "/dashboard",
    label: "仪表盘",
    icon: LayoutDashboard,
    group: "工作空间",
  },
  { path: "/components", label: "组件示例", icon: Blocks, group: "工作空间" },
  {
    path: "/article/list",
    label: "文章列表",
    icon: FileText,
    group: "文章管理",
  },
  {
    path: "/article/categories",
    label: "分类管理",
    icon: FolderOpen,
    group: "文章管理",
  },
  { path: "/profile", label: "个人资料", icon: UserRound, group: "系统管理" },
  { path: "/users", label: "用户管理", icon: Users, group: "系统管理" },
  {
    path: "/permissions",
    label: "权限管理",
    icon: KeyRound,
    group: "系统管理",
  },
  { path: "/roles", label: "角色管理", icon: ShieldCheck, group: "系统管理" },
  { path: "/settings", label: "系统设置", icon: Settings, group: "系统管理" },
  {
    path: "/notifications",
    label: "通知管理",
    icon: Megaphone,
    group: "系统管理",
  },
];
