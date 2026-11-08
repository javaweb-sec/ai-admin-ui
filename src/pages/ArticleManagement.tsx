import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  articleApi,
  articleCategoryApi,
  type Article,
  type ArticleCategory,
} from "@/services/articleApi";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import {
  FileText,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  Pin,
  ArrowUpDown,
} from "lucide-react";
import type { Pages } from "@/services/articleApi";
import DataPagination from "@/components/DataPagination";

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "1", label: "草稿" },
  { value: "2", label: "已发布" },
  { value: "3", label: "已下架" },
];

const ArticleManagementPage = () => {
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * 筛选条件持久化到 URL searchParams：
   * - 点编辑跳转 详情页 返回后能从 URL 恢复（history 堆栈保留）
   * - 刷新页面、分享链接都能复现同一查询状态
   */
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("q") ?? "";
  const categoryFilter = searchParams.get("category") ?? "";
  const statusFilter = searchParams.get("status") ?? "";
  const page = Number(searchParams.get("page") ?? "0");
  const pageSize = 20;

  /** 统一更新 URL：replace 模式避免每次输入都加历史记录。 */
  const updateParams = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === "" || v === null) next.delete(k);
            else next.set(k, String(v));
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const [articles, setArticles] = useState<Pages<Article> | null>(null);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 表格批量勾选：仅当前页生效，切页/换筛选/刷新后自动清空
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await articleApi.search({
        keyword: keyword || undefined,
        categoryId: categoryFilter ? Number(categoryFilter) : undefined,
        status: statusFilter ? Number(statusFilter) : undefined,
        page,
        size: pageSize,
        sortBy: "createdAt",
        order: "desc",
      });
      setArticles(data);
      // 换页/换筛选 后可见文章变了，上轮选中的 ID 应该清空，避免跨页误选
      setSelectedIds(new Set());
    } catch (e: any) {
      toast({
        title: "加载失败",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [keyword, categoryFilter, statusFilter, page]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await articleCategoryApi.listAll();
      setCategories(data);
    } catch {
      // 静默失败
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /** 带当前列表 URL（含 query）作为 state.from 传给编辑器，返回时优先走这个 URL。 */
  const openCreate = () =>
    navigate("/article/new", {
      state: { from: location.pathname + location.search },
    });

  const openEdit = (article: Article) =>
    navigate(`/article/edit/${article.id}`, {
      state: { from: location.pathname + location.search },
    });

  const openPreview = async (article: Article) => {
    setPreviewLoading(true);
    try {
      const detail = await articleApi.getById(article.id);
      setPreviewArticle(detail);
    } catch (e: any) {
      toast({
        title: "获取详情失败",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (article: Article) => {
    if (!confirm(`确认删除文章「${article.title}」？`)) return;
    try {
      await articleApi.delete(article.id);
      toast({ title: "删除成功" });
      fetchArticles();
    } catch (e: any) {
      toast({
        title: "删除失败",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (article: Article, status: number) => {
    try {
      await articleApi.updateStatus(article.id, status);
      toast({ title: "状态更新成功" });
      fetchArticles();
    } catch (e: any) {
      toast({
        title: "状态更新失败",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const statusBadge = (s: number) => {
    switch (s) {
      case 1:
        return <Badge variant="secondary">草稿</Badge>;
      case 2:
        return <Badge className="bg-green-500 text-white">已发布</Badge>;
      case 3:
        return <Badge variant="destructive">已下架</Badge>;
      default:
        return <Badge variant="outline">{s}</Badge>;
    }
  };

  const formatDate = (s: string) =>
    s ? new Date(s).toLocaleString("zh-CN") : "-";

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name || String(id);

  // 全选状态：全选 / 部分选中 / 未选。Radix Checkbox 支持 'indeterminate' 中间态
  const currentArticles = articles?.content ?? [];
  const allSelected =
    currentArticles.length > 0 &&
    currentArticles.every((a) => selectedIds.has(a.id));
  const someSelected =
    !allSelected && currentArticles.some((a) => selectedIds.has(a.id));
  const headerCheckedState: boolean | "indeterminate" = allSelected
    ? true
    : someSelected
      ? "indeterminate"
      : false;

  const toggleAll = (checked: boolean | "indeterminate") => {
    if (checked === true)
      setSelectedIds(new Set(currentArticles.map((a) => a.id)));
    else setSelectedIds(new Set());
  };

  const toggleOne = (id: number, checked: boolean | "indeterminate") => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked === true) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确认删除选中的 ${selectedIds.size} 篇文章？`)) return;
    setBatchDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const deleted = await articleApi.batchDelete(ids);
      toast({ title: "删除成功", description: `共删除 ${deleted} 篇` });
      setSelectedIds(new Set());
      fetchArticles();
    } catch (e: any) {
      toast({
        title: "批量删除失败",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setBatchDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4 min-w-0">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
              文章管理
            </h1>
          </div>

          <div className="w-full space-y-4">
            {/* 筛选栏 */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <Input
                    placeholder="搜索标题/摘要..."
                    value={keyword}
                    onChange={(e) =>
                      updateParams({ q: e.target.value, page: 0 })
                    }
                    className="h-9 w-56"
                  />
                  <Select
                    value={categoryFilter || " "}
                    onValueChange={(v) =>
                      updateParams({ category: v === " " ? "" : v, page: 0 })
                    }
                  >
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="全部分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">全部分类</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter || " "}
                    onValueChange={(v) =>
                      updateParams({ status: v === " " ? "" : v, page: 0 })
                    }
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
                      updateParams({ page: 0 });
                      fetchArticles();
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {selectedIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBatchDelete}
                      disabled={batchDeleting}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除 ({selectedIds.size})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={openCreate}
                    className={selectedIds.size > 0 ? "" : "ml-auto"}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新建文章
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 文章列表 */}
            <Card>
              <CardContent className="pt-4">
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border dark:border-white/10">
                        <th className="py-3 px-4 w-10">
                          <Checkbox
                            checked={headerCheckedState}
                            onCheckedChange={toggleAll}
                            disabled={currentArticles.length === 0}
                            aria-label="全选当前页"
                          />
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground w-16">
                          封面
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          标题
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          分类
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                          来源
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                          <div className="flex items-center justify-center gap-1">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                            阅读
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                          置顶
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
                      {articles?.content.map((article) => (
                        <tr
                          key={article.id}
                          className="border-b border-border dark:border-white/10 hover:bg-muted/50"
                        >
                          <td className="py-3 px-4">
                            <Checkbox
                              checked={selectedIds.has(article.id)}
                              onCheckedChange={(c) => toggleOne(article.id, c)}
                              aria-label={`选中 ${article.title}`}
                            />
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                            {article.id}
                          </td>
                          <td className="py-3 px-4">
                            {article.coverUrl ? (
                              <img
                                src={article.coverUrl}
                                alt={article.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-[260px]">
                            <div
                              className="font-medium truncate"
                              title={article.title}
                            >
                              {article.title}
                            </div>
                            {article.summary && (
                              <div
                                className="text-xs text-muted-foreground truncate"
                                title={article.summary}
                              >
                                {article.summary}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              {article.categoryName ||
                                getCategoryName(article.categoryId)}
                            </Badge>
                          </td>
                          <td
                            className="py-3 px-4 hidden md:table-cell text-sm text-muted-foreground max-w-[160px] truncate"
                            title={article.sourceName || ""}
                          >
                            {article.sourceUrl ? (
                              <a
                                href={article.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline"
                              >
                                {article.sourceName || article.sourceUrl}
                              </a>
                            ) : (
                              article.sourceName || "-"
                            )}
                          </td>
                          <td className="text-center py-3 px-4 text-muted-foreground text-sm">
                            {article.viewCount}
                          </td>
                          <td className="text-center py-3 px-4">
                            {article.isTop ? (
                              <Pin className="h-4 w-4 text-orange-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                -
                              </span>
                            )}
                          </td>
                          <td className="text-center py-3 px-4">
                            {statusBadge(article.status)}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {formatDate(article.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPreview(article)}
                                title="预览"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(article)}
                                title="编辑"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {article.status === 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleStatusChange(article, 2)}
                                  title="发布"
                                >
                                  发布
                                </Button>
                              )}
                              {article.status === 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-orange-500 hover:text-orange-600"
                                  onClick={() => handleStatusChange(article, 3)}
                                  title="下架"
                                >
                                  下架
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(article)}
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!articles || articles.content.length === 0) && (
                        <tr>
                          <td
                            colSpan={11}
                            className="text-center py-10 text-muted-foreground"
                          >
                            {loading ? "加载中..." : "暂无文章"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {articles && (
                  <DataPagination
                    currentPage={articles.number}
                    totalPages={articles.totalPages}
                    totalElements={articles.totalElements}
                    onPageChange={(p) => updateParams({ page: p })}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 文章预览弹窗 */}
      <Dialog
        open={previewArticle !== null}
        onOpenChange={() => setPreviewArticle(null)}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewArticle?.title}
            </DialogTitle>
          </DialogHeader>
          {previewArticle && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>
                  分类：
                  {previewArticle.categoryName ||
                    getCategoryName(previewArticle.categoryId)}
                </span>
                <span>阅读：{previewArticle.viewCount}</span>
                <span>点赞：{previewArticle.likeCount}</span>
                {previewArticle.sourceName && (
                  <span>来源：{previewArticle.sourceName}</span>
                )}
                <span>创建：{formatDate(previewArticle.createdAt)}</span>
              </div>
              {previewArticle.coverUrl && (
                <img
                  src={previewArticle.coverUrl}
                  alt="cover"
                  className="w-full max-h-64 object-cover rounded"
                />
              )}
              {previewArticle.summary && (
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground italic">
                  {previewArticle.summary}
                </div>
              )}
              <div
                className="border rounded-md p-4 bg-background"
                data-color-mode={resolvedTheme}
              >
                <MDEditor.Markdown
                  source={previewArticle.content}
                  rehypePlugins={[[rehypeSanitize]]}
                  style={{ backgroundColor: "transparent" }}
                />
              </div>
            </div>
          )}
          {previewLoading && (
            <div className="py-12 text-center text-muted-foreground">
              加载中...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArticleManagementPage;
