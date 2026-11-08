import { useState } from "react";
import { useAdminStore, type Role } from "@/stores/adminStore";
import { Heading, Field, Confirm, Empty, act } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export default function Roles() {
  const { roles, permissions, saveRole, deleteRole } = useAdminStore();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Role | null>(null);
  const groups = [...new Set(permissions.map((p) => p.group))];
  const filtered = roles.filter((r) =>
    `${r.name} ${r.code}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="角色管理"
        description="配置角色与权限集合。当前为授权模型演示，真实访问控制需由服务端实施。"
      >
        <Button
          onClick={() =>
            setForm({
              id: crypto.randomUUID(),
              name: "",
              code: "",
              description: "",
              permissions: [],
            })
          }
        >
          新增角色
        </Button>
      </Heading>
      <Input
        aria-label="搜索角色"
        placeholder="搜索角色名称或标识"
        className="max-w-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="responsive-card-grid grid min-w-0 grid-cols-1 gap-5">
        {filtered.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                {role.name}
                <Badge variant="secondary">
                  {role.builtIn ? "内置" : "自定义"}
                </Badge>
              </CardTitle>
              <p className="font-mono text-xs text-muted-foreground">
                {role.code}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {role.description || "暂无描述"}
              </p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((id) => (
                  <Badge variant="outline" key={id}>
                    {permissions.find((p) => p.id === id)?.name}
                  </Badge>
                ))}
                {!role.permissions.length && (
                  <span className="text-sm text-muted-foreground">
                    尚未分配权限
                  </span>
                )}
              </div>
              <div>
                {role.builtIn ? (
                  <p className="text-xs text-muted-foreground">
                    管理员自动拥有全部权限，不能删除或修改。
                  </p>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm({ ...role, permissions: [...role.permissions] })
                      }
                    >
                      编辑与授权
                    </Button>
                    <Confirm
                      label="删除"
                      title={`删除角色「${role.name}」？`}
                      description="此操作将删除本地角色配置。"
                      destructive
                      onConfirm={() =>
                        act(() => deleteRole(role.id), "角色已删除")
                      }
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!filtered.length && <Empty>没有匹配的角色</Empty>}
      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent className="max-h-[85dvh] overflow-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>角色配置</DialogTitle>
            <DialogDescription>
              设置基本信息并勾选需要授予的权限。
            </DialogDescription>
          </DialogHeader>
          {form && (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (act(() => saveRole(form), "角色已保存")) setForm(null);
              }}
            >
              <Field id="role-name" label="角色名称">
                <Input
                  id="role-name"
                  required
                  maxLength={40}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field id="role-code" label="角色标识">
                <Input
                  id="role-code"
                  required
                  maxLength={64}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </Field>
              <Field id="role-description" label="描述">
                <Textarea
                  id="role-description"
                  maxLength={200}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Field>
              <div className="flex justify-between">
                <span className="text-sm">
                  已选 {form.permissions.length} 项权限
                </span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() =>
                    setForm({
                      ...form,
                      permissions:
                        form.permissions.length === permissions.length
                          ? []
                          : permissions.map((p) => p.id),
                    })
                  }
                >
                  {form.permissions.length === permissions.length
                    ? "取消全选"
                    : "全选"}
                </Button>
              </div>
              {groups.map((group) => (
                <fieldset key={group} className="rounded-lg border p-4">
                  <legend className="px-2 text-sm">{group}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {permissions
                      .filter((p) => p.group === group)
                      .map((p) => (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={form.permissions.includes(p.id)}
                            onCheckedChange={(checked) =>
                              setForm({
                                ...form,
                                permissions:
                                  checked === true
                                    ? [...form.permissions, p.id]
                                    : form.permissions.filter(
                                        (id) => id !== p.id,
                                      ),
                              })
                            }
                          />
                          {p.name}
                        </label>
                      ))}
                  </div>
                </fieldset>
              ))}
              <Button type="submit">保存角色</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
