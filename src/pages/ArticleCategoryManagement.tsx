import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  articleCategoryApi,
  type ArticleCategory,
  type CategoryCreateRequest,
} from "@/services/articleApi";
import { FolderOpen, Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";
import type { Pages } from "@/services/articleApi";
import LucideIconPicker, {
  DynamicLucideIcon,
} from "@/components/LucideIconPicker";
import DataPagination from "@/components/DataPagination";

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "1", label: "启用" },
  { value: "0", label: "禁用" },
];

const EMPTY_FORM: CategoryCreateRequest = {
  name: "",
  icon: "",
  description: "",
  parentId: 0,
  sortOrder: 0,
  status: 1,
};

const ArticleCategoryManagementPage = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [categories, setCategories] = useState<Pages<ArticleCategory> | null>(
    null,
  );
  const [allCategories, setAllCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ArticleCategory | null>(null);
  const [form, setForm] = useState<CategoryCreateRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await articleCategoryApi.search({
        keyword: keyword || undefined,
        status: statusFilter ? Number(statusFilter) : undefined,
        page,
        size: pageSize,
        sortBy: "sortOrder",
        order: "asc",
      });
      setCategories(data);
    } catch (e: any) {
      toast({
        title: "加载失败",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, page]);

  const fetchAllCategories = useCallback(async () => {
    try {
      const data = await articleCategoryApi.listAll();
      setAllCategories(data);
    } catch {
      // 静默失败，仅用于父分类下拉
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (cat: ArticleCategory) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      icon: cat.icon || "",
      description: cat.description || "",
      parentId: cat.parentId ?? 0,
      sortOrder: cat.sortOrder,
      status: cat.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      toast({ title: "请输入分类名称", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (editTarget) {
        await articleCategoryApi.update(editTarget.id, form);
        toast({ title: "更新成功" });
      } else {
        await articleCategoryApi.create(form);
        toast({ title: "创建成功" });
      }
      setDialogOpen(false);
      fetchCategories();
      fetchAllCategories();
    } catch (e: any) {
      toast({
        title: editTarget ? "更新失败" : "创建失败",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: ArticleCategory) => {
    if (!confirm(`确认删除分类「${cat.name}」？该分类下不能有文章。`)) return;
    try {
      await articleCategoryApi.delete(cat.id);
      toast({ title: "删除成功" });
      fetchCategories();
      fetchAllCategories();
    } catch (e: any) {
      toast({
        title: "删除失败",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const statusBadge = (s: number) => {
    return s === 1 ? (
      <Badge className="bg-green-500 text-white">启用</Badge>
    ) : (
      <Badge variant="secondary">禁用</Badge>
    );
  };

  const formatDate = (s: string) =>
    s ? new Date(s).toLocaleString("zh-CN") : "-";

  const parentOptions = allCategories.filter(
    (c) => !editTarget || c.id !== editTarget.id,
  );

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4 min-w-0">
            <FolderOpen className="h-5 w-5 text-primary shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              文章分类
            </h1>
          </div>

          <div className="w-full space-y-4">
            {/* 筛选栏 */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <Input
                    placeholder="搜索分类名称/描述..."
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setPage(0);
                    }}
                    className="h-9 w-56"
                  />
                  <Select
                    value={statusFilter || " "}
                    onValueChange={(v) => {
                      setStatusFilter(v === " " ? "" : v);
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue placeholder="全部状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value || " "} value={o.value || " "}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPage(0);
                      fetchCategories();
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={openCreate} className="ml-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    新建分类
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 分类列表 */}
            <Card>
              <CardContent className="pt-4">
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border dark:border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          分类名称
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          描述
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          父分类
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                          排序
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                          文章数
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                          状态
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          创建时间
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories?.content.map((cat) => (
                        <tr
                          key={cat.id}
                          className="border-b border-border dark:border-white/10 hover:bg-muted/50"
                        >
                          <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                            {cat.id}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              {cat.icon && (
                                <DynamicLucideIcon
                                  name={cat.icon}
                                  className="h-4 w-4 text-primary"
                                />
                              )}
                              <span>{cat.name}</span>
                            </div>
                          </td>
                          <td
                            className="py-3 px-4 max-w-[200px] truncate text-sm text-muted-foreground"
                            title={cat.description}
                          >
                            {cat.description || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {cat.parentId ? (
                              allCategories.find((c) => c.id === cat.parentId)
                                ?.name || cat.parentId
                            ) : (
                              <span className="text-xs">顶级</span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4 text-sm">
                            {cat.sortOrder}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="font-medium">
                              {cat.articleCount ?? 0}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            {statusBadge(cat.status)}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {formatDate(cat.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(cat)}
                                title="编辑"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(cat)}
                                title="删除"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!categories || categories.content.length === 0) && (
                        <tr>
                          <td
                            colSpan={9}
                            className="text-center py-10 text-muted-foreground"
                          >
                            {loading ? "加载中..." : "暂无分类"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {categories && (
                  <DataPagination
                    currentPage={categories.number}
                    totalPages={categories.totalPages}
                    totalElements={categories.totalElements}
                    onPageChange={setPage}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 新建/编辑分类弹窗 */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!submitting) setDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              {editTarget ? "编辑分类" : "新建分类"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                分类名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="请输入分类名称"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>图标</Label>
              <LucideIconPicker
                value={form.icon}
                onChange={(v) => setForm((f) => ({ ...f, icon: v }))}
                placeholder="选择 Lucide 图标（可搜索）"
              />
            </div>
            <div className="space-y-1.5">
              <Label>描述</Label>
              <Input
                placeholder="分类描述（选填）"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>父分类</Label>
                <Select
                  value={String(form.parentId ?? 0)}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, parentId: Number(v) }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="顶级分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">顶级分类</SelectItem>
                    {parentOptions.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>排序权重</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.sortOrder ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>状态</Label>
              <Select
                value={String(form.status ?? 1)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: Number(v) }))
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">启用</SelectItem>
                  <SelectItem value="0">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArticleCategoryManagementPage;
