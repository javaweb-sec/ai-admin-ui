import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Moon, Sun, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/contexts/ThemeContext";
import { safeRedirect } from "@/services/auth";
import { appConfig } from "@/config/app";
import LoginBackground from "@/components/LoginBackground";
const accountKey = `${appConfig.storagePrefix}:remembered-account`;
function rememberedAccount() {
  try {
    return localStorage.getItem(accountKey) || "";
  } catch {
    return "";
  }
}
export default function Login() {
  const [username, setUsername] = useState(
    () => rememberedAccount() || "admin",
  );
  const [remember, setRemember] = useState(() => !!rememberedAccount());
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuthStore();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const target = safeRedirect(location.state?.from);
  const isDark = resolvedTheme === "dark";
  if (user) return <Navigate to={target} replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      try {
        if (remember) localStorage.setItem(accountKey, username.trim());
        else localStorage.removeItem(accountKey);
      } catch {
        /* Login works when preferences cannot be saved. */
      }
      navigate(target, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }
  const inputStyle =
    "h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus-visible:ring-violet-500/40 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:placeholder:text-gray-500";
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden">
      <LoginBackground isDark={isDark} />
      <div className="absolute right-4 top-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          aria-label="切换主题"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
      </div>
      <main className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-20">
        <div
          className={`w-full max-w-[420px] rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8 ${isDark ? "border-white/10 bg-gray-900/70 shadow-black/40" : "border-white/40 bg-white/80 shadow-gray-300/50"}`}
        >
          <div className="mb-8 flex flex-col items-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-white/10">
              <img src="/favicon.svg" alt="" className="h-11 w-11" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">
                {appConfig.name} 管理系统
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {appConfig.description}
              </p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <Label className="sr-only" htmlFor="username">
                  账号
                </Label>
                <UserRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-3.5 z-10 h-4 w-4 text-gray-400"
                />
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="请输入账号"
                  required
                  disabled={loading}
                  className={`${inputStyle} pl-10`}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                />
              </div>
              <div className="relative">
                <Label className="sr-only" htmlFor="password">
                  密码
                </Label>
                <Input
                  id="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="请输入密码"
                  required
                  disabled={loading}
                  className={`${inputStyle} pr-12`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  aria-label={visible ? "隐藏密码" : "显示密码"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                  className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:text-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  {visible ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember-account"
                checked={remember}
                onCheckedChange={(value) => setRemember(value === true)}
              />
              <Label
                htmlFor="remember-account"
                className="cursor-pointer text-sm font-normal text-gray-500 dark:text-gray-400"
              >
                记住账号
              </Label>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 font-medium text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:from-purple-700 hover:to-violet-700 hover:shadow-purple-500/40 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  登录中…
                </>
              ) : (
                "登 录"
              )}
            </Button>
          </form>
          <div className="mt-6 border-t border-gray-200/60 pt-5 text-center text-xs leading-6 text-gray-500 dark:border-white/10">
            <p>演示账号：admin / admin123</p>
            <p>本地演示模式 · 无需后端服务</p>
          </div>
        </div>
      </main>
    </div>
  );
}
