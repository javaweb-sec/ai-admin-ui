// @vitest-environment jsdom
import { beforeEach, it, expect } from "vitest";
import { articleApi, articleCategoryApi } from "./articleApi";
beforeEach(() => localStorage.clear());
it("preserves markdown, filters articles and prevents deleting referenced categories", async () => {
  const c = await articleCategoryApi.create({ name: "教程" });
  const a = await articleApi.create({
    categoryId: c.id,
    title: "Markdown 示例",
    content: "# 标题\n\n**正文**",
    status: 1,
  });
  expect((await articleApi.getById(a.id)).content).toContain("**正文**");
  await expect(articleCategoryApi.delete(c.id)).rejects.toThrow();
  await articleApi.updateStatus(a.id, 2);
  expect(
    (await articleApi.search({ status: 2, keyword: "示例" })).totalElements,
  ).toBe(1);
  expect((await articleApi.search({ status: 1 })).totalElements).toBe(0);
  expect(await articleApi.batchDelete([a.id])).toBe(1);
  await articleCategoryApi.delete(c.id);
});
it("rejects category cycles and publishing in disabled categories", async () => {
  const a = await articleCategoryApi.create({ name: "父分类" });
  const b = await articleCategoryApi.create({ name: "子分类", parentId: a.id });
  await expect(
    articleCategoryApi.update(a.id, { name: a.name, parentId: b.id }),
  ).rejects.toThrow();
  await articleCategoryApi.update(b.id, { name: b.name, status: 0 });
  await expect(
    articleApi.create({ categoryId: b.id, title: "测试", content: "正文" }),
  ).rejects.toThrow();
});

it("normalizes non-finite pagination and filters pinned articles", async () => {
  const c = await articleCategoryApi.create({ name: "排序示例" });
  await articleApi.create({ categoryId: c.id, title: "B", content: "正文" });
  await articleApi.create({
    categoryId: c.id,
    title: "A",
    content: "正文",
    isTop: true,
  });
  const result = await articleApi.search({
    page: Infinity,
    size: Infinity,
    isTop: true,
  });
  expect(result.number).toBe(0);
  expect(result.size).toBe(20);
  expect(result.content.map((a) => a.title)).toEqual(["A"]);
  const { delete: remove } = articleApi;
  await remove(result.content[0].id);
  expect((await articleApi.search()).totalElements).toBe(1);
});
it("reports corrupt storage without overwriting it", async () => {
  localStorage.setItem("ai-admin-ui:articles", "{broken");
  await expect(articleApi.search()).rejects.toThrow("格式异常");
  expect(localStorage.getItem("ai-admin-ui:articles")).toBe("{broken");
});
