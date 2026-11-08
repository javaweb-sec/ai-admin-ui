import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  articleApi,
  articleCategoryApi,
  type ArticleCategory,
  type ArticleCreateRequest,
} from "@/services/articleApi";
import { uploadApi } from "@/services/uploadApi";
import MarkdownEditor from "@/components/MarkdownEditor";
import {
  ArrowLeft,
  FileText,
  Upload,
  X,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";

const EMPTY_FORM: ArticleCreateRequest = {
  categoryId: 0,
  title: "",
  summary: "",
  content: "",
  coverUrl: "",
  sourceName: "",
  sourceUrl: "",
  isTop: false,
  status: 1,
};

const DRAFT_KEY_PREFIX = "ai-admin-ui:article-draft:";
const DRAFT_DEBOUNCE_MS = 1500;

interface DraftPayload {
  form: ArticleCreateRequest;
  savedAt: number;
}

/**
 * 文章编辑/新建独立页面。
 *
 * 路由：
 * - /article/new：新建模式
 * - /article/edit/:id：编辑模式
 *
 * 特性：
 * - 自动草稿：表单变化 debounce 1.5s 写入 localStorage
 * - 草稿恢复：进入页面若有草稿且较新，弹 confirm 询问是否恢复
 * - 提交成功后自动清除对应草稿
 *
 * @author yz
 */
const ArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  /** 列表页跳转时透传的来源 URL（含 query），返回时优先用它而不是 history. */
  const candidate = (location.state as { from?: unknown } | null)?.from;
  const fromUrl =
    typeof candidate === "string" &&
    /^\/article\/list(?:[?#]|$)/.test(candidate)
      ? candidate
      : "/article/list";

  const isEdit = !!id;
  const articleId = isEdit ? Number(id) : null;

  /**
   * 当前文档对应的草稿 key。
   */
  const draftKey = useMemo(
    () => DRAFT_KEY_PREFIX + (isEdit ? `edit_${articleId}` : "new"),
    [isEdit, articleId],
  );

  const [form, setForm] = useState<ArticleCreateRequest>(EMPTY_FORM);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);

  /**
   * 标记初始化是否完成，避免在回填阶段触发草稿写入。
   */
  const initializedRef = useRef(false);
  const debounceRef = useRef<number | null>(null);

  // ============ 加载分类 ============
  useEffect(() => {
    articleCategoryApi
      .listAll()
      .then(setCategories)
      .catch(() => {
        // 静默
      });
  }, []);

  // ============ 初始化表单（已保存数据 + 本地草稿协调） ============
  useEffect(() => {
    let cancelled = false;
    const loadDraft = (): DraftPayload | null => {
      try {
        const raw = localStorage.getItem(draftKey);
        return raw ? (JSON.parse(raw) as DraftPayload) : null;
      } catch {
        return null;
      }
    };

    const init = async () => {
      const draft = loadDraft();

      if (isEdit && articleId) {
        try {
          const remote = await articleApi.getById(articleId);
          if (cancelled) return;
          const remoteForm: ArticleCreateRequest = {
            categoryId: remote.categoryId,
            title: remote.title,
            summary: remote.summary || "",
            content: remote.content,
            coverUrl: remote.coverUrl || "",
            sourceName: remote.sourceName || "",
            sourceUrl: remote.sourceUrl || "",
            isTop: remote.isTop,
            status: remote.status,
          };
          // 草稿存在且晚于已保存数据最后更新时，提示恢复
          const remoteUpdatedAt = new Date(
            remote.updatedAt || remote.createdAt,
          ).getTime();
          if (draft && draft.savedAt > remoteUpdatedAt) {
            const ok = window.confirm(
              `检测到本地未保存的草稿（${new Date(draft.savedAt).toLocaleString("zh-CN")}），是否恢复？\n点击"取消"将使用本地已保存版本。`,
            );
            if (ok) {
              setForm(draft.form);
              setDraftSavedAt(draft.savedAt);
            } else {
              setForm(remoteForm);
              localStorage.removeItem(draftKey);
            }
          } else {
            setForm(remoteForm);
            if (draft) localStorage.removeItem(draftKey);
          }
        } catch (e: any) {
          toast({
            title: "加载文章失败",
            description: e.message,
            variant: "destructive",
          });
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        // 新建模式
        if (draft) {
          const ok = window.confirm(
            `检测到本地未发布的草稿（${new Date(draft.savedAt).toLocaleString("zh-CN")}），是否恢复？\n点击"取消"将清除草稿，开始新文章。`,
          );
          if (ok) {
            setForm(draft.form);
            setDraftSavedAt(draft.savedAt);
          } else {
            localStorage.removeItem(draftKey);
          }
        }
        setLoading(false);
      }

      // 标记完成初始化
      requestAnimationFrame(() => {
        initializedRef.current = true;
      });
    };

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // ============ 自动草稿（debounce） ============
  useEffect(() => {
    if (!initializedRef.current) return;
    // 空表单不写草稿
    const isEmpty =
      !form.title?.trim() &&
      !form.content?.trim() &&
      !form.summary?.trim() &&
      !form.coverUrl?.trim();
    if (isEmpty) return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const payload: DraftPayload = { form, savedAt: Date.now() };
      try {
        localStorage.setItem(draftKey, JSON.stringify(payload));
        setDraftSavedAt(payload.savedAt);
      } catch (e) {
        // localStorage 写失败（如配额超出）静默
        console.warn("[ArticleEditor] 草稿保存失败", e);
      }
    }, DRAFT_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [form, draftKey]);

  // ============ 离开页面前提示 ============
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (draftSavedAt && !submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [draftSavedAt, submitting]);

  // ============ 封面上传 ============
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "仅支持图片文件", variant: "destructive" });
      return;
    }
    setCoverUploading(true);
    try {
      const result = await uploadApi.uploadImage(file);
      setForm((f) => ({ ...f, coverUrl: result.url }));
      toast({ title: "封面上传成功" });
    } catch (e: any) {
      toast({
        title: "封面上传失败",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setCoverUploading(false);
    }
  };

  const pickCoverFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleCoverUpload(file);
    };
    input.click();
  };

  // ============ 提交 ============
  const handleSubmit = async () => {
    if (!form.categoryId) {
      toast({ title: "请选择分类", variant: "destructive" });
      return;
    }
    if (!form.title?.trim()) {
      toast({ title: "请输入文章标题", variant: "destructive" });
      return;
    }
    if (!form.content?.trim()) {
      toast({ title: "请输入文章内容", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && articleId) {
        await articleApi.update(articleId, form);
        toast({ title: "更新成功" });
      } else {
        await articleApi.create(form);
        toast({ title: "创建成功" });
      }
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      initializedRef.current = false;
      localStorage.removeItem(draftKey);
      setDraftSavedAt(null);
      navigate(fromUrl ?? "/article/list");
    } catch (e: any) {
      toast({
        title: isEdit ? "更新失败" : "创建失败",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ============ 丢弃草稿 ============
  const handleDiscardDraft = () => {
    if (!window.confirm("确认丢弃本地草稿？此操作不可撤销。")) return;
    localStorage.removeItem(draftKey);
    setDraftSavedAt(null);
    if (isEdit && articleId) {
      // 重新拉已保存数据
      window.location.reload();
    } else {
      setForm(EMPTY_FORM);
    }
    toast({ title: "草稿已丢弃" });
  };

  // ============ 返回列表（顶部 ArrowLeft 使用） ============
  const handleCancel = () => {
    if (draftSavedAt) {
      const ok = window.confirm(
        "当前有未保存的草稿，离开后草稿仍会保留在本地，确认离开？",
      );
      if (!ok) return;
    }
    // 优先用列表页透传的来源 URL（含完整 query），避免 history 栈状态不可靠；
    // 若是直接访问 /article/edit/:id（没有 from），兜底跳到列表首页
    navigate(fromUrl ?? "/article/list");
  };

  const formatTime = useCallback(
    (ts: number) => new Date(ts).toLocaleTimeString("zh-CN", { hour12: false }),
    [],
  );

  // ============ 渲染 ============
  return (
    <>
      <div className="flex min-w-0 flex-col gap-4 md:gap-6">
        <div className="shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="shrink-0 px-2 sm:px-3"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">返回</span>
            </Button>
            <FileText className="h-5 w-5 text-primary shrink-0 hidden sm:block" />
            <h1 className="text-base sm:text-xl font-bold text-foreground truncate min-w-0">
              {isEdit ? "编辑文章" : "新建文章"}
            </h1>
            <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
              {draftSavedAt && (
                <span className="text-xs text-muted-foreground hidden lg:inline">
                  草稿已保存 {formatTime(draftSavedAt)}
                </span>
              )}
              {draftSavedAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDiscardDraft}
                  className="text-destructive hover:text-destructive shrink-0 px-2 sm:px-3"
                  title="丢弃本地草稿"
                >
                  <Trash2 className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">丢弃草稿</span>
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={submitting || loading}
                className="shrink-0 px-2 sm:px-4"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 sm:mr-1" />
                )}
                <span className="hidden sm:inline">
                  {submitting ? "保存中..." : "保存"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 overflow-auto px-4 md:px-6 pb-4 md:pb-6">
            <Card>
              <CardContent className="py-20 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" />
                加载中...
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="min-w-0">
            <div className="article-editor-grid grid min-w-0 grid-cols-1 items-start gap-4">
              <Card className="min-w-0">
                <CardContent className="min-w-0 space-y-4 pt-6">
                  <div className="space-y-1.5">
                    <Label>
                      标题 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="请输入文章标题"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>摘要</Label>
                    <Textarea
                      placeholder="文章摘要（选填，最多500字）"
                      value={form.summary}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, summary: e.target.value }))
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <Label>
                      正文内容 <span className="text-destructive">*</span>
                    </Label>

                    <div className="min-w-0">
                      <MarkdownEditor
                        value={form.content}
                        onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                        height={480}
                        placeholder="支持 Markdown 语法，可实时预览；图片可使用图片链接"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="min-w-0">
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-1.5">
                    <Label>
                      分类 <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.categoryId ? String(form.categoryId) : ""}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, categoryId: Number(v) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>状态</Label>
                    <Select
                      value={String(form.status ?? 1)}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, status: Number(v) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">草稿</SelectItem>
                        <SelectItem value="2">发布</SelectItem>
                        <SelectItem value="3">下架</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>封面图</Label>
                    {form.coverUrl ? (
                      <div className="space-y-2">
                        <div className="relative group">
                          <img
                            src={form.coverUrl}
                            alt="cover"
                            className="w-full h-36 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({ ...f, coverUrl: "" }))
                            }
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                            title="移除封面"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <Input
                          value={form.coverUrl}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, coverUrl: e.target.value }))
                          }
                          className="text-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={pickCoverFile}
                          disabled={coverUploading}
                          className="w-full"
                        >
                          <Upload className="h-3.5 w-3.5 mr-1" />
                          {coverUploading ? "上传中..." : "重新上传"}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={pickCoverFile}
                        disabled={coverUploading}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {coverUploading ? "上传中..." : "上传封面图"}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>来源名称</Label>
                    <Input
                      placeholder="来源站点名称"
                      value={form.sourceName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sourceName: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>来源链接</Label>
                    <Input
                      placeholder="https://example.com/original"
                      value={form.sourceUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sourceUrl: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Switch
                      checked={form.isTop ?? false}
                      onCheckedChange={(v) =>
                        setForm((f) => ({ ...f, isTop: v }))
                      }
                      id="isTop"
                    />
                    <Label htmlFor="isTop" className="cursor-pointer">
                      置顶显示
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArticleEditorPage;
