import { Link } from "react-router-dom";
import { Users, Activity, CheckCircle2, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
const trend = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map(
  (day, i) => ({ day, value: [120, 180, 145, 260, 210, 320, 380][i] }),
);
export default function Dashboard() {
  return (
    <>
      <div>
        <p className="text-sm text-primary">工作空间</p>
        <h1 className="mt-2 text-2xl font-semibold">概览仪表盘</h1>
        <p className="mt-2 text-muted-foreground">
          欢迎回来，这里是你的工作概览。以下均为演示数据。
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "用户总数", value: "1,280", icon: Users },
          { label: "本周访问", value: "8,640", icon: Activity },
          { label: "完成事项", value: "328", icon: CheckCircle2 },
          { label: "应用模块", value: "12", icon: Layers },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex justify-between text-sm text-muted-foreground">
                {label}
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-5 text-3xl font-semibold">{value}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                示例统计 · 最近 7 天
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">访问趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.12}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    name="访问量"
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="url(#trend)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">开始使用</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-7 text-muted-foreground">
              基础页面、交互组件和主题设置已准备就绪，可以根据实际业务逐步扩展。
            </p>
            <Button asChild className="w-full">
              <Link to="/users">查看用户列表示例</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/components">浏览组件</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/settings">设置外观</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
