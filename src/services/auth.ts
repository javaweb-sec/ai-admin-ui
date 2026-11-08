export interface SessionUser {
  username: string;
  displayName: string;
  role: string;
}
// 本地演示适配器。正式项目应替换为服务端认证，并在服务端实施权限控制。
export async function signIn(
  username: string,
  password: string,
): Promise<SessionUser> {
  if (username.trim() !== "admin" || password !== "admin123")
    throw new Error("账号或密码错误");
  return { username: "admin", displayName: "管理员", role: "管理员" };
}
export function safeRedirect(path: unknown): string {
  return typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\") &&
    !/^\/login(?:[/?#]|$)/.test(path)
    ? path
    : "/dashboard";
}
