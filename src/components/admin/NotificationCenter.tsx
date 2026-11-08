import { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAdminStore } from "@/stores/adminStore";
import { AppIcon, Empty } from "./shared";
export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { notices, markRead } = useAdminStore();
  const published = notices
    .filter((n) => n.status === "published")
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  const unread = published.filter((n) => !n.readAt).length;
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`通知中心，${unread} 条未读`}
        onClick={() => setOpen(true)}
      >
        <Bell />
        {unread > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        )}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>通知中心</SheetTitle>
            <SheetDescription>
              {unread} 条未读 · 当前浏览器本地通知
            </SheetDescription>
          </SheetHeader>
          <div className="flex justify-between">
            <Button
              size="sm"
              variant="outline"
              disabled={!unread}
              onClick={() => markRead()}
            >
              全部标为已读
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/notifications" onClick={() => setOpen(false)}>
                管理通知
              </Link>
            </Button>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-auto">
            {published.map((n) => (
              <article key={n.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start gap-3">
                  <span className="text-primary">
                    <AppIcon name={n.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-all text-sm">
                      {n.title}
                      {!n.readAt && (
                        <span className="ml-2 text-xs text-primary">未读</span>
                      )}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {n.category} ·{" "}
                      {new Date(n.publishedAt!).toLocaleString("zh-CN")}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap break-all text-sm leading-6">
                      {n.content}
                    </p>
                    {!n.readAt && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 px-0"
                        onClick={() => markRead(n.id)}
                      >
                        标为已读
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {!published.length && <Empty>暂无已发布通知</Empty>}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
