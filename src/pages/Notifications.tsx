import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useState } from "react";
import { useAdminStore, type Notice } from "@/stores/adminStore";
import {
  Heading,
  Field,
  Confirm,
  Empty,
  AppIcon,
  IconPicker,
  act,
} from "@/components/admin/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
const date = (value: string) => new Date(value).toLocaleString("zh-CN");
export default function Notifications() {
  const { notices, saveNotice, publishNotice, withdrawNotice, deleteNotice } =
    useAdminStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState<Notice | null>(null);
  const [preview, setPreview] = useState<Notice | null>(null);
  const filtered = notices.filter(
    (n) =>
      (status === "all" || n.status === status) &&
      `${n.title} ${n.content}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        title="通知管理"
        description="编写通知并选择图标。发布后显示在当前浏览器的通知中心，不会向外部发送消息。"
      >
        <Button
          onClick={() =>
            setForm({
              id: crypto.randomUUID(),
              title: "",
              content: "",
              icon: "Megaphone",
              category: "公告",
              status: "draft",
              updatedAt: new Date().toISOString(),
            })
          }
        >
          新建通知
        </Button>
      </Heading>
      <div className="flex flex-wrap gap-3">
        <Input
          aria-label="搜索通知"
          placeholder="搜索标题或内容"
          className="max-w-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="通知状态" className="w-full sm:w-40">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="published">已发布</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        {filtered.map((n) => (
          <Card key={n.id}>
            <CardContent className="flex gap-4 p-5">
              <div className="h-fit rounded-xl bg-primary/10 p-3 text-primary">
                <AppIcon name={n.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-all text-base">{n.title}</h2>
                  <Badge
                    variant={n.status === "published" ? "default" : "secondary"}
                  >
                    {n.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                  <Badge variant="outline">{n.category}</Badge>
                </div>
                <p className="my-3 line-clamp-2 whitespace-pre-wrap break-all text-sm text-muted-foreground">
                  {n.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  {n.status === "published"
                    ? `发布于 ${date(n.publishedAt!)}`
                    : `更新于 ${date(n.updatedAt)}`}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreview(n)}
                  >
                    预览
                  </Button>
                  {n.status === "draft" ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setForm({ ...n })}
                      >
                        编辑
                      </Button>
                      <Confirm
                        label="发布"
                        title="发布这条通知？"
                        description="发布后将显示在本地通知中心。"
                        onConfirm={() =>
                          act(
                            () => publishNotice(n.id),
                            "通知已发布到本地通知中心",
                          )
                        }
                      />
                      <Confirm
                        label="删除"
                        title="删除这条草稿？"
                        description="删除后无法恢复。"
                        destructive
                        onConfirm={() =>
                          act(() => deleteNotice(n.id), "草稿已删除")
                        }
                      />
                    </>
                  ) : (
                    <Confirm
                      label="撤回"
                      title="撤回这条通知？"
                      description="通知将从通知中心移除，并恢复为可编辑草稿。"
                      onConfirm={() =>
                        act(() => withdrawNotice(n.id), "通知已撤回")
                      }
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!filtered.length && (
          <Card>
            <Empty>
              {notices.length
                ? "没有匹配的通知"
                : "还没有通知，点击“新建通知”开始编写。"}
            </Empty>
          </Card>
        )}
      </div>
      <Dialog open={!!form} onOpenChange={(v) => !v && setForm(null)}>
        <DialogContent className="max-h-[85dvh] overflow-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑通知</DialogTitle>
            <DialogDescription>
              先保存为草稿，再从列表确认发布。内容以纯文本展示。
            </DialogDescription>
          </DialogHeader>
          {form && (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (act(() => saveNotice(form), "草稿已保存")) setForm(null);
              }}
            >
              <Field id="notice-title" label="通知标题">
                <Input
                  id="notice-title"
                  required
                  maxLength={80}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </Field>
              <Field id="notice-category" label="通知分类">
                <Select
                  value={form.category}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value as Notice["category"] })
                  }
                >
                  <SelectTrigger id="notice-category">
                    <SelectValue placeholder="请选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {["公告", "更新", "维护"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="space-y-2">
                <p className="text-sm">通知图标</p>
                <IconPicker
                  value={form.icon}
                  onChange={(icon) => setForm({ ...form, icon })}
                />
              </div>
              <Field
                id="notice-content"
                label={`通知内容（${form.content.length}/5000）`}
              >
                <Textarea
                  id="notice-content"
                  required
                  rows={8}
                  maxLength={5000}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
              </Field>
              <div className="flex gap-3">
                <Button type="submit">保存草稿</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreview(form)}
                >
                  预览效果
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-h-[85dvh] overflow-auto">
          <DialogHeader>
            <div className="mb-3 text-primary">
              <AppIcon name={preview?.icon || "Bell"} />
            </div>
            <DialogTitle className="break-all">
              {preview?.title || "通知标题"}
            </DialogTitle>
            <DialogDescription>
              {preview?.category} · 通知预览
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap break-all text-sm leading-7">
            {preview?.content || "在此展示通知正文"}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
