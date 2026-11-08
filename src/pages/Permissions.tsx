import { useState } from "react";
import { useAdminStore, type Permission } from "@/stores/adminStore";
import { Heading, Field, Confirm, Empty, act } from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
export default function Permissions() {
  const { permissions, roles, savePermission, deletePermission } =
    useAdminStore();
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Permission | null>(null);
  const filtered = permissions.filter((p) =>
    `${p.name} ${p.code} ${p.group}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="权限管理"
        description="维护权限标识与分组，再到角色管理中分配权限。内置权限只读。"
      >
        <Button
          onClick={() =>
            setForm({
              id: crypto.randomUUID(),
              name: "",
              code: "",
              group: "自定义",
            })
          }
        >
          新增权限
        </Button>
      </Heading>
      <Card>
        <div className="border-b p-5">
          <Input
            aria-label="搜索权限"
            placeholder="搜索名称、标识或分组"
            className="max-w-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {["权限名称", "权限标识", "分组", "引用角色", "操作"].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.name}{" "}
                  {p.builtIn && <Badge variant="secondary">内置</Badge>}
                </TableCell>
                <TableCell className="font-mono text-xs">{p.code}</TableCell>
                <TableCell>{p.group}</TableCell>
                <TableCell>
                  {roles.filter((r) => r.permissions.includes(p.id)).length}
                </TableCell>
                <TableCell>
                  {p.builtIn ? (
                    <span className="text-muted-foreground">只读</span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setForm({ ...p })}
                      >
                        编辑
                      </Button>
                      <Confirm
                        label="删除"
                        title={`删除权限「${p.name}」？`}
                        description="被其他角色引用的权限需先解除授权。"
                        destructive
                        onConfirm={() =>
                          act(() => deletePermission(p.id), "权限已删除")
                        }
                      />
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filtered.length && <Empty>没有匹配的权限</Empty>}
      </Card>
      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>权限配置</DialogTitle>
            <DialogDescription>
              标识示例：orders:read。用于后续业务授权对接。
            </DialogDescription>
          </DialogHeader>
          {form && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (act(() => savePermission(form), "权限已保存"))
                  setForm(null);
              }}
            >
              {(
                [
                  { key: "name", label: "权限名称" },
                  { key: "code", label: "权限标识" },
                  { key: "group", label: "所属分组" },
                ] as const
              ).map(({ key, label }) => (
                <Field key={key} id={`permission-${key}`} label={label}>
                  <Input
                    id={`permission-${key}`}
                    required
                    maxLength={64}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </Field>
              ))}
              <Button type="submit">保存权限</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
