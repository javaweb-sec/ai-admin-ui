import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { appConfig } from "@/config/app";
export default function Settings() {
  const { currentTheme, setTheme } = useTheme();
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">系统设置</h1>
        <p className="mt-2 text-muted-foreground">个性化你的工作空间。</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">外观主题</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {(
              [
                { value: "light", label: "浅色模式" },
                { value: "dark", label: "深色模式" },
                { value: "system", label: "跟随系统" },
              ] as const
            ).map((option) => (
              <Button
                key={option.value}
                aria-pressed={currentTheme === option.value}
                variant={currentTheme === option.value ? "default" : "outline"}
                onClick={() => setTheme(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            主题偏好将保存在当前浏览器中。
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">关于模板</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            {appConfig.name} · {appConfig.description}
          </p>
          <p>React + TypeScript + Vite + Tailwind CSS + Radix UI</p>
          <p>当前为本地演示模式，认证和业务数据均可按项目需要替换。</p>
        </CardContent>
      </Card>
    </>
  );
}
