import { useState, type FormEvent } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { toast } from "sonner";
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
};
const initialUsers: User[] = [
  {
    id: 1,
    name: "管理员",
    email: "admin@example.com",
    role: "管理员",
    active: true,
  },
  {
    id: 2,
    name: "示例用户",
    email: "user@example.com",
    role: "成员",
    active: true,
  },
  {
    id: 3,
    name: "访客",
    email: "guest@example.com",
    role: "成员",
    active: false,
  },
];
export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    if (!name) return;
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      toast.error("邮箱已存在");
      return;
    }
    setUsers([
      ...users,
      { id: Date.now(), name, email, role: "成员", active: true },
    ]);
    setOpen(false);
    toast.success("已添加演示用户");
  }
  const filtered = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">用户管理</h1>
          <p className="mt-2 text-muted-foreground">
            表格、搜索与表单示例。修改仅在当前页面保留。
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus />
          新增用户
        </Button>
      </div>
      <Card>
        <div className="flex items-center gap-3 border-b p-5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            className="max-w-sm"
            aria-label="搜索用户"
            placeholder="搜索姓名或邮箱"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="ml-auto whitespace-nowrap text-sm text-muted-foreground">
            {filtered.length} 位用户
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.active ? "default" : "secondary"}>
                    {user.active ? "启用" : "停用"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setUsers(
                        users.map((u) =>
                          u.id === user.id ? { ...u, active: !u.active } : u,
                        ),
                      )
                    }
                  >
                    {user.active ? "停用" : "启用"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!filtered.length && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  没有找到匹配的用户
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增用户</DialogTitle>
            <DialogDescription>填写本地演示用户信息。</DialogDescription>
          </DialogHeader>
          <form onSubmit={add} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" name="name" required maxLength={40} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <Button type="submit">保存用户</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
