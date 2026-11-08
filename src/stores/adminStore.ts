import { create } from "zustand";
import { persist } from "zustand/middleware";
import { appConfig } from "@/config/app";

export type Profile = {
  displayName: string;
  email: string;
  phone: string;
  department: string;
  bio: string;
  avatar: string;
};
export type Permission = {
  id: string;
  name: string;
  code: string;
  group: string;
  builtIn?: boolean;
};
export type Role = {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  builtIn?: boolean;
};
export type Notice = {
  id: string;
  title: string;
  content: string;
  icon: string;
  category: "公告" | "更新" | "维护";
  status: "draft" | "published";
  updatedAt: string;
  publishedAt?: string;
  readAt?: string;
};
export const initialPermissions: Permission[] = [
  {
    id: "users:read",
    code: "users:read",
    name: "查看用户",
    group: "用户管理",
    builtIn: true,
  },
  {
    id: "users:write",
    code: "users:write",
    name: "编辑用户",
    group: "用户管理",
    builtIn: true,
  },
  {
    id: "roles:manage",
    code: "roles:manage",
    name: "管理角色",
    group: "系统管理",
    builtIn: true,
  },
  {
    id: "permissions:manage",
    code: "permissions:manage",
    name: "管理权限",
    group: "系统管理",
    builtIn: true,
  },
  {
    id: "notices:edit",
    code: "notices:edit",
    name: "编辑通知",
    group: "通知管理",
    builtIn: true,
  },
  {
    id: "notices:publish",
    code: "notices:publish",
    name: "发布通知",
    group: "通知管理",
    builtIn: true,
  },
];
export function validateCode(code: string) {
  if (!/^[a-z][a-z0-9:_-]{1,63}$/.test(code))
    throw new Error("标识需为 2–64 位小写字母、数字、冒号、下划线或连字符");
}
function required(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label}不能为空`);
}
interface AdminState {
  profile: Profile;
  permissions: Permission[];
  roles: Role[];
  notices: Notice[];
  saveProfile: (profile: Profile) => void;
  savePermission: (permission: Permission) => void;
  deletePermission: (id: string) => void;
  saveRole: (role: Role) => void;
  deleteRole: (id: string) => void;
  saveNotice: (notice: Notice) => void;
  publishNotice: (id: string) => void;
  withdrawNotice: (id: string) => void;
  deleteNotice: (id: string) => void;
  markRead: (id?: string) => void;
}
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      profile: {
        displayName: "管理员",
        email: "admin@example.com",
        phone: "",
        department: "",
        bio: "",
        avatar: "UserRound",
      },
      permissions: initialPermissions,
      roles: [
        {
          id: "admin",
          code: "admin",
          name: "管理员",
          description: "内置管理角色，拥有所有配置权限。",
          permissions: initialPermissions.map((p) => p.id),
          builtIn: true,
        },
        {
          id: "editor",
          code: "editor",
          name: "内容编辑",
          description: "查看用户并编辑通知草稿。",
          permissions: ["users:read", "notices:edit"],
        },
      ],
      notices: [],
      saveProfile: (profile) => {
        required(profile.displayName, "昵称");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
          throw new Error("请输入有效邮箱");
        set({
          profile: { ...profile, displayName: profile.displayName.trim() },
        });
      },
      savePermission: (permission) => {
        required(permission.name, "权限名称");
        required(permission.group, "所属分组");
        validateCode(permission.code);
        const { permissions, roles } = get();
        if (permissions.find((p) => p.id === permission.id)?.builtIn)
          throw new Error("内置权限不能修改");
        if (
          permissions.some(
            (p) => p.id !== permission.id && p.code === permission.code,
          )
        )
          throw new Error("权限标识已存在");
        const next = { ...permission, builtIn: false };
        const items = permissions.some((p) => p.id === next.id)
          ? permissions.map((p) => (p.id === next.id ? next : p))
          : [...permissions, next];
        set({
          permissions: items,
          roles: roles.map((r) =>
            r.id === "admin"
              ? { ...r, permissions: items.map((p) => p.id) }
              : r,
          ),
        });
      },
      deletePermission: (id) => {
        const { permissions, roles } = get();
        if (permissions.find((p) => p.id === id)?.builtIn)
          throw new Error("内置权限不能删除");
        if (roles.some((r) => r.id !== "admin" && r.permissions.includes(id)))
          throw new Error("该权限已被角色引用，请先解除授权");
        set({
          permissions: permissions.filter((p) => p.id !== id),
          roles: roles.map((r) => ({
            ...r,
            permissions: r.permissions.filter((p) => p !== id),
          })),
        });
      },
      saveRole: (role) => {
        required(role.name, "角色名称");
        validateCode(role.code);
        const { roles, permissions } = get();
        if (roles.find((r) => r.id === role.id)?.builtIn)
          throw new Error("内置管理员不能修改");
        if (roles.some((r) => r.id !== role.id && r.code === role.code))
          throw new Error("角色标识已存在");
        if (
          role.permissions.some((id) => !permissions.some((p) => p.id === id))
        )
          throw new Error("包含已失效权限，请重新选择");
        const next = {
          ...role,
          builtIn: false,
          permissions: [...new Set(role.permissions)],
        };
        set({
          roles: roles.some((r) => r.id === next.id)
            ? roles.map((r) => (r.id === next.id ? next : r))
            : [...roles, next],
        });
      },
      deleteRole: (id) => {
        if (get().roles.find((r) => r.id === id)?.builtIn)
          throw new Error("内置管理员不能删除");
        set({ roles: get().roles.filter((r) => r.id !== id) });
      },
      saveNotice: (notice) => {
        required(notice.title, "通知标题");
        required(notice.content, "通知内容");
        if (notice.title.length > 80 || notice.content.length > 5000)
          throw new Error("标题最多 80 字，内容最多 5000 字");
        const previous = get().notices.find((n) => n.id === notice.id);
        if (previous?.status === "published")
          throw new Error("请先撤回通知再编辑");
        const next: Notice = {
          ...notice,
          title: notice.title.trim(),
          content: notice.content.trim(),
          status: "draft",
          updatedAt: new Date().toISOString(),
          publishedAt: undefined,
          readAt: undefined,
        };
        set({
          notices: previous
            ? get().notices.map((n) => (n.id === next.id ? next : n))
            : [next, ...get().notices],
        });
      },
      publishNotice: (id) => {
        const notice = get().notices.find((n) => n.id === id);
        if (!notice || notice.status !== "draft")
          throw new Error("仅草稿可发布");
        required(notice.title, "标题");
        required(notice.content, "内容");
        const now = new Date().toISOString();
        set({
          notices: get().notices.map((n) =>
            n.id === id
              ? {
                  ...n,
                  status: "published",
                  publishedAt: now,
                  updatedAt: now,
                  readAt: undefined,
                }
              : n,
          ),
        });
      },
      withdrawNotice: (id) =>
        set({
          notices: get().notices.map((n) =>
            n.id === id
              ? {
                  ...n,
                  status: "draft",
                  publishedAt: undefined,
                  readAt: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : n,
          ),
        }),
      deleteNotice: (id) => {
        if (get().notices.find((n) => n.id === id)?.status === "published")
          throw new Error("请先撤回通知再删除");
        set({ notices: get().notices.filter((n) => n.id !== id) });
      },
      markRead: (id) =>
        set({
          notices: get().notices.map((n) =>
            n.status === "published" && (!id || n.id === id)
              ? { ...n, readAt: n.readAt || new Date().toISOString() }
              : n,
          ),
        }),
    }),
    { name: `${appConfig.storagePrefix}:admin`, version: 1 },
  ),
);
