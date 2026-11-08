import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { safeRedirect } from "@/services/auth";
import { appConfig } from "@/config/app";
export default function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const target = safeRedirect(location.state?.from);
  if (user) return <Navigate to={target} replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate(target, { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-emerald-950 p-14 text-white lg:flex">
        <div className="absolute -right-32 top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="flex items-center gap-3 text-xl font-semibold">
          <img src="/favicon.svg" alt="" className="h-10 w-10" />
          {appConfig.name}
        </div>
        <div className="relative">
          <p className="mb-6 text-sm tracking-widest text-emerald-300">
            YOUR WORKSPACE, SIMPLIFIED
          </p>
          <h1 className="text-5xl font-semibold leading-tight">
            让管理更简单，
            <br />
            让工作更高效。
          </h1>
          <p className="mt-6 max-w-md leading-7 text-emerald-100/70">
            统一的设计语言，灵活的页面布局。为你的下一个管理系统提供一个清晰的起点。
          </p>
        </div>
        <p className="text-sm text-emerald-100/50">{appConfig.description}</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <img src="/favicon.svg" alt="" className="h-12 w-12" />
          <div>
            <h2 className="text-3xl font-semibold">欢迎回来</h2>
            <p className="mt-2 text-muted-foreground">
              登录 {appConfig.name} 管理控制台
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">账号</Label>
            <Input
              id="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button disabled={loading} className="w-full" type="submit">
            {loading ? "正在登录…" : "登录"}
          </Button>
          <p className="rounded-lg bg-muted p-4 text-sm leading-6 text-muted-foreground">
            演示账号：admin / admin123
            <br />
            当前使用本地演示登录，无需后端服务。
          </p>
        </form>
      </section>
    </div>
  );
}
