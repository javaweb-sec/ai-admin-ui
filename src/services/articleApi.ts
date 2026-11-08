import { appConfig } from "@/config/app";
export interface ArticleCategory {
  id: number;
  categoryUuid: string;
  name: string;
  icon?: string;
  description?: string;
  parentId: number;
  sortOrder: number;
  status: number;
  articleCount?: number;
  children?: ArticleCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: number;
  articleUuid: string;
  categoryId: number;
  categoryName?: string;
  title: string;
  summary?: string;
  content: string;
  coverUrl?: string;
  authorId?: number;
  sourceName?: string;
  sourceUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isTop: boolean;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateRequest {
  name: string;
  icon?: string;
  description?: string;
  parentId?: number;
  sortOrder?: number;
  status?: number;
}

export interface ArticleCreateRequest {
  categoryId: number;
  title: string;
  summary?: string;
  content: string;
  coverUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  isTop?: boolean;
  status?: number;
}

export interface ArticleSearchRequest {
  keyword?: string;
  categoryId?: number;
  status?: number;
  isTop?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  order?: string;
}

export interface CategorySearchRequest {
  keyword?: string;
  status?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  order?: string;
}

export interface Pages<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
type Database = {
  articles: Article[];
  categories: ArticleCategory[];
  nextId: number;
};
const key = `${appConfig.storagePrefix}:articles`;
function read(): Database {
  const raw = localStorage.getItem(key);
  if (!raw) return { articles: [], categories: [], nextId: 1 };
  try {
    const data = JSON.parse(raw) as Database;
    if (
      !Array.isArray(data.articles) ||
      !Array.isArray(data.categories) ||
      !Number.isSafeInteger(data.nextId) ||
      data.nextId < 1
    )
      throw new Error();
    return data;
  } catch {
    throw new Error("本地文章数据格式异常，请先备份并检查浏览器存储");
  }
}
function write(db: Database) {
  try {
    localStorage.setItem(key, JSON.stringify(db));
  } catch {
    throw new Error("本地存储空间不足，请缩小封面图片或清理不需要的文章");
  }
}
function page<T>(
  items: T[],
  params: { page?: number; size?: number },
): Pages<T> {
  const size = Number.isFinite(params.size)
    ? Math.max(1, Math.min(100, Math.floor(params.size!)))
    : 20;
  const totalPages = Math.ceil(items.length / size);
  const number = Math.min(
    Number.isFinite(params.page) ? Math.max(0, Math.floor(params.page!)) : 0,
    Math.max(0, totalPages - 1),
  );
  return {
    content: items.slice(number * size, (number + 1) * size),
    totalElements: items.length,
    totalPages,
    size,
    number,
    first: number === 0,
    last: number >= totalPages - 1,
  };
}
function categoryData(db: Database) {
  return db.categories
    .map((c) => ({
      ...c,
      articleCount: db.articles.filter((a) => a.categoryId === c.id).length,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
function validateCategory(
  db: Database,
  data: CategoryCreateRequest,
  id?: number,
) {
  if (!data.name.trim()) throw new Error("分类名称不能为空");
  if (data.status !== undefined && ![0, 1].includes(data.status))
    throw new Error("分类状态无效");
  if (data.sortOrder !== undefined && !Number.isFinite(data.sortOrder))
    throw new Error("排序必须为有效数字");
  if (db.categories.some((c) => c.id !== id && c.name === data.name.trim()))
    throw new Error("分类名称已存在");
  let parent = data.parentId || 0;
  const seen = new Set<number>();
  while (parent) {
    if (parent === id || seen.has(parent)) throw new Error("分类不能循环引用");
    seen.add(parent);
    const node = db.categories.find((c) => c.id === parent);
    if (!node) throw new Error("上级分类不存在");
    parent = node.parentId;
  }
}
export const articleCategoryApi = {
  async listAll() {
    return categoryData(read());
  },
  async search(params: CategorySearchRequest = {}) {
    return page(
      categoryData(read()).filter(
        (c) =>
          (params.status === undefined || c.status === params.status) &&
          (!params.keyword ||
            `${c.name} ${c.description || ""}`
              .toLowerCase()
              .includes(params.keyword.toLowerCase())),
      ),
      params,
    );
  },
  async create(data: CategoryCreateRequest) {
    const db = read();
    validateCategory(db, data);
    const now = new Date().toISOString();
    const item: ArticleCategory = {
      ...data,
      name: data.name.trim(),
      id: db.nextId++,
      categoryUuid: crypto.randomUUID(),
      parentId: data.parentId || 0,
      sortOrder: data.sortOrder || 0,
      status: data.status ?? 1,
      createdAt: now,
      updatedAt: now,
    };
    db.categories.push(item);
    write(db);
    return item;
  },
  async update(id: number, data: CategoryCreateRequest) {
    const db = read();
    validateCategory(db, data, id);
    const old = db.categories.find((c) => c.id === id);
    if (!old) throw new Error("分类不存在");
    const item = {
      ...old,
      ...data,
      name: data.name.trim(),
      updatedAt: new Date().toISOString(),
    };
    db.categories = db.categories.map((c) => (c.id === id ? item : c));
    write(db);
    return item;
  },
  async delete(id: number) {
    const db = read();
    if (
      db.articles.some((a) => a.categoryId === id) ||
      db.categories.some((c) => c.parentId === id)
    )
      throw new Error("分类下存在文章或子分类，不能删除");
    db.categories = db.categories.filter((c) => c.id !== id);
    write(db);
  },
};
function validateArticle(db: Database, data: ArticleCreateRequest) {
  if (!data.title.trim() || !data.content.trim())
    throw new Error("标题和正文不能为空");
  if ((data.summary?.length || 0) > 500) throw new Error("摘要最多 500 字");
  if (!db.categories.some((c) => c.id === data.categoryId && c.status === 1))
    throw new Error("请选择已启用的分类");
  if (![1, 2, 3].includes(data.status ?? 1)) throw new Error("文章状态无效");
}
export const articleApi = {
  async search(params: ArticleSearchRequest = {}) {
    const db = read();
    const items = db.articles
      .filter(
        (a) =>
          (params.categoryId === undefined ||
            a.categoryId === params.categoryId) &&
          (params.status === undefined || a.status === params.status) &&
          (params.isTop === undefined || a.isTop === params.isTop) &&
          (!params.keyword ||
            `${a.title} ${a.summary || ""}`
              .toLowerCase()
              .includes(params.keyword.toLowerCase())),
      )
      .map((a) => ({
        ...a,
        categoryName: db.categories.find((c) => c.id === a.categoryId)?.name,
      }))
      .sort((a, b) => {
        const key =
          (["createdAt", "updatedAt", "viewCount", "title"] as const).find(
            (key) => key === params.sortBy,
          ) || "createdAt";
        const left = a[key],
          right = b[key];
        const comparison =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left).localeCompare(String(right));
        return (
          Number(b.isTop) - Number(a.isTop) ||
          comparison * (params.order === "asc" ? 1 : -1)
        );
      });
    return page(items, params);
  },
  async getById(id: number) {
    const db = read();
    const a = db.articles.find((a) => a.id === id);
    if (!a) throw new Error("文章不存在或已删除");
    return {
      ...a,
      categoryName: db.categories.find((c) => c.id === a.categoryId)?.name,
    };
  },
  async create(data: ArticleCreateRequest) {
    const db = read();
    validateArticle(db, data);
    const now = new Date().toISOString();
    const item: Article = {
      ...data,
      id: db.nextId++,
      articleUuid: crypto.randomUUID(),
      title: data.title.trim(),
      isTop: data.isTop || false,
      status: data.status ?? 1,
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    };
    db.articles.push(item);
    write(db);
    return item;
  },
  async update(id: number, data: ArticleCreateRequest) {
    const db = read();
    validateArticle(db, data);
    const old = db.articles.find((a) => a.id === id);
    if (!old) throw new Error("文章不存在");
    const item = {
      ...old,
      ...data,
      title: data.title.trim(),
      updatedAt: new Date().toISOString(),
    };
    db.articles = db.articles.map((a) => (a.id === id ? item : a));
    write(db);
    return item;
  },
  async updateStatus(id: number, status: number) {
    const db = read();
    const item = db.articles.find((a) => a.id === id);
    if (!item) throw new Error("文章不存在");
    if (![1, 2, 3].includes(status)) throw new Error("无效状态");
    if (status === 2) validateArticle(db, { ...item, status });
    item.status = status;
    item.updatedAt = new Date().toISOString();
    write(db);
    return item;
  },
  async delete(id: number) {
    const db = read();
    db.articles = db.articles.filter((article) => article.id !== id);
    write(db);
  },
  async batchDelete(ids: number[]) {
    const db = read();
    const before = db.articles.length;
    db.articles = db.articles.filter((a) => !ids.includes(a.id));
    write(db);
    return before - db.articles.length;
  },
};
