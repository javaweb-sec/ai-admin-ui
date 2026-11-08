// Local image adapter: no upload service or network request.
export const uploadApi = {
  async uploadImage(file: File): Promise<{ url: string }> {
    if (
      !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
        file.type,
      )
    )
      throw new Error("仅支持 PNG、JPEG、WebP、GIF 图片");
    if (file.size > 1024 * 1024) throw new Error("本地模板封面限制为 1 MB");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: String(reader.result) });
      reader.onerror = () => reject(new Error("读取图片失败"));
      reader.readAsDataURL(file);
    });
  },
};
