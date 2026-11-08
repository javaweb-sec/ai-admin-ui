// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { useAdminStore, type Notice } from "./adminStore";
const initial = useAdminStore.getInitialState();
beforeEach(() => {
  localStorage.clear();
  useAdminStore.setState(initial, true);
});
describe("admin configuration", () => {
  it("protects built-in roles and permissions", () => {
    expect(() => useAdminStore.getState().deleteRole("admin")).toThrow();
    expect(() =>
      useAdminStore.getState().deletePermission("users:read"),
    ).toThrow();
  });
  it("rejects duplicate codes and maintains permission references", () => {
    const s = useAdminStore.getState();
    s.savePermission({
      id: "custom",
      name: "查看订单",
      code: "orders:read",
      group: "订单",
    });
    expect(() =>
      s.savePermission({
        id: "other",
        name: "重复",
        code: "orders:read",
        group: "订单",
      }),
    ).toThrow();
    s.saveRole({
      id: "reader",
      name: "读者",
      code: "reader",
      description: "",
      permissions: ["custom"],
    });
    expect(() => s.deletePermission("custom")).toThrow();
    s.deleteRole("reader");
    s.deletePermission("custom");
    expect(
      useAdminStore.getState().roles.find((r) => r.id === "admin")!.permissions,
    ).not.toContain("custom");
  });
  it("enforces notification lifecycle and unread state", () => {
    const s = useAdminStore.getState();
    const n: Notice = {
      id: "notice",
      title: "维护通知",
      content: "本地通知内容",
      icon: "Wrench",
      category: "维护",
      status: "draft",
      updatedAt: "",
    };
    s.saveNotice(n);
    s.publishNotice(n.id);
    expect(useAdminStore.getState().notices[0].status).toBe("published");
    expect(() => s.saveNotice(n)).toThrow();
    expect(() => s.deleteNotice(n.id)).toThrow();
    s.markRead(n.id);
    expect(useAdminStore.getState().notices[0].readAt).toBeTruthy();
    s.withdrawNotice(n.id);
    s.saveNotice({ ...n, title: "更新通知" });
    s.publishNotice(n.id);
    expect(useAdminStore.getState().notices[0].readAt).toBeUndefined();
  });
  it("restores a persisted profile after in-memory state is reset", async () => {
    const s = useAdminStore.getState();
    s.saveProfile({ ...s.profile, displayName: "模板管理员" });
    const saved = localStorage.getItem("ai-admin-ui:admin")!;
    useAdminStore.setState({ profile: initial.profile });
    localStorage.setItem("ai-admin-ui:admin", saved);
    await useAdminStore.persist.rehydrate();
    expect(useAdminStore.getState().profile.displayName).toBe("模板管理员");
    expect(
      JSON.parse(localStorage.getItem("ai-admin-ui:admin")!).state.profile
        .displayName,
    ).toBe("模板管理员");
  });
});
