import { useState, type ReactNode } from "react";
import {
  Bell,
  Check,
  Copy,
  Info,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Terminal,
  CalendarDays,
} from "lucide-react";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";

function Demo({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}
const rows = [
  { name: "设计规范", owner: "林设计", status: "进行中", amount: "12 项" },
  { name: "组件整理", owner: "陈开发", status: "已完成", amount: "28 项" },
  { name: "使用文档", owner: "王产品", status: "待开始", amount: "8 项" },
];
export default function Components() {
  const [enabled, setEnabled] = useState(true);
  const [checked, setChecked] = useState(false);
  const [plan, setPlan] = useState("standard");
  const [role, setRole] = useState("editor");
  const [volume, setVolume] = useState([68]);
  const [date, setDate] = useState<Date>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("演示项目");
  const [savedName, setSavedName] = useState("演示项目");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">组件示例</h1>
          <p className="mt-2 text-muted-foreground">
            探索 shadcn UI 的常用组件，体验当前主题下的样式与交互。
          </p>
        </div>
        <Badge variant="outline">交互演示 · 本页状态</Badge>
      </div>
      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="basics">基础与表单</TabsTrigger>
          <TabsTrigger value="overlays">弹层与反馈</TabsTrigger>
          <TabsTrigger value="data">数据与布局</TabsTrigger>
        </TabsList>
        <TabsContent value="basics" className="grid gap-6 lg:grid-cols-2">
          <Demo
            title="按钮 Button"
            description="主要、次要、描边、危险、幽灵及链接操作。"
          >
            <div className="flex flex-wrap gap-3">
              {(
                [
                  "default",
                  "secondary",
                  "outline",
                  "destructive",
                  "ghost",
                  "link",
                ] as const
              ).map((variant, i) => (
                <Button
                  key={variant}
                  variant={variant}
                  onClick={() =>
                    toast.info(
                      [
                        "主要操作",
                        "次要操作",
                        "描边操作",
                        "危险操作示例",
                        "幽灵操作",
                        "链接操作",
                      ][i],
                    )
                  }
                >
                  {
                    [
                      "主要按钮",
                      "次要按钮",
                      "描边按钮",
                      "危险按钮",
                      "幽灵按钮",
                      "链接按钮",
                    ][i]
                  }
                </Button>
              ))}
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={() => toast.success("已添加演示项")}>
                <Plus />
                小号按钮
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => toast.info("大号按钮")}
              >
                大号按钮
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="复制示例"
                    onClick={() => toast.info("这是图标按钮演示")}
                  >
                    <Copy />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>图标按钮需要可访问名称</TooltipContent>
              </Tooltip>
              <Button disabled>禁用状态</Button>
            </div>
          </Demo>
          <Demo
            title="输入 Input / Textarea"
            description="文本、搜索、多行内容与表单校验。"
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("演示表单已提交");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="demo-email">邮箱</Label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-note">备注</Label>
                <Textarea
                  id="demo-note"
                  placeholder="输入备注…"
                  maxLength={200}
                />
              </div>
              <Input aria-label="只读示例" value="只读内容" readOnly />
              <Button type="submit">验证并提交</Button>
            </form>
          </Demo>
          <Demo
            title="选择 Select / RadioGroup"
            description="标准下拉框与单选组，适用于筛选和设置。"
          >
            <div className="space-y-2">
              <Label htmlFor="demo-role">角色</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="demo-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="editor">编辑者</SelectItem>
                  <SelectItem value="viewer">查看者</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <RadioGroup
              aria-label="方案选择"
              value={plan}
              onValueChange={setPlan}
            >
              {[
                ["standard", "标准方案"],
                ["advanced", "高级方案"],
              ].map(([value, label]) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem value={value} id={`plan-${value}`} />
                  <Label htmlFor={`plan-${value}`}>{label}</Label>
                </div>
              ))}
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              当前选择：{role} / {plan}
            </p>
          </Demo>
          <Demo
            title="开关与滑块"
            description="Checkbox、Switch、Slider 与 Progress 联动。"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id="demo-terms"
                checked={checked}
                onCheckedChange={(v) => setChecked(v === true)}
              />
              <Label htmlFor="demo-terms">
                {checked ? "已勾选示例选项" : "勾选示例选项"}
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="demo-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="demo-enabled">
                {enabled ? "通知已开启" : "通知已关闭"}
              </Label>
            </div>
            <Separator />
            <Label>完成进度：{volume[0]}%</Label>
            <Slider
              aria-label="完成进度"
              value={volume}
              onValueChange={setVolume}
              max={100}
              step={1}
            />
            <Progress value={volume[0]} aria-label={`当前完成 ${volume[0]}%`} />
          </Demo>
          <Demo
            title="日期选择 Calendar"
            description="日历置于 Popover 内，支持月份切换和日期选取。"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarDays />
                  {date ? date.toLocaleDateString("zh-CN") : "选择一个日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={zhCN}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              {date
                ? `已选择 ${date.toLocaleDateString("zh-CN")}`
                : "尚未选择日期"}
            </p>
            <Button
              variant="ghost"
              disabled={!date}
              onClick={() => setDate(undefined)}
            >
              清除日期
            </Button>
          </Demo>
          <Demo
            title="标签与头像"
            description="Badge 与 Avatar 的常用状态和文字占位。"
          >
            <div className="flex flex-wrap gap-2">
              <Badge>进行中</Badge>
              <Badge variant="secondary">待处理</Badge>
              <Badge variant="outline">已归档</Badge>
              <Badge variant="destructive">异常</Badge>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/15 text-primary">
                  林
                </AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>陈</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                头像加载失败时可展示首字
              </span>
            </div>
          </Demo>
        </TabsContent>
        <TabsContent value="overlays" className="grid gap-6 lg:grid-cols-2">
          <Demo
            title="对话框 Dialog"
            description="带输入、提交和关闭行为的标准编辑弹窗。"
          >
            <p className="text-sm">当前名称：{savedName}</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setName(savedName)}>编辑示例名称</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>编辑名称</DialogTitle>
                  <DialogDescription>
                    修改只保存在当前示例页面。
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!name.trim()) return;
                    setSavedName(name.trim());
                    setDialogOpen(false);
                    toast.success("名称已更新");
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="demo-project">项目名称</Label>
                    <Input
                      id="demo-project"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={40}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      取消
                    </Button>
                    <Button type="submit">保存修改</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </Demo>
          <Demo
            title="确认框 AlertDialog"
            description="用于需要明确确认的操作；此示例不会删除任何数据。"
          >
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">打开确认框</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认执行示例操作？</AlertDialogTitle>
                  <AlertDialogDescription>
                    仅展示确认交互，不会修改或删除业务数据。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => toast.success("已确认示例操作")}
                  >
                    确认操作
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Demo>
          <Demo
            title="侧边抽屉 Sheet"
            description="适合详情查看、筛选和轻量设置。"
          >
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Settings />
                  打开设置抽屉
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>示例设置</SheetTitle>
                  <SheetDescription>
                    抽屉与页面共享通知开关状态。
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-8 flex items-center justify-between gap-4">
                  <Label htmlFor="sheet-enabled">接收通知</Label>
                  <Switch
                    id="sheet-enabled"
                    checked={enabled}
                    onCheckedChange={setEnabled}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </Demo>
          <Demo
            title="菜单与悬浮提示"
            description="DropdownMenu、Popover 与 Tooltip。"
          >
            <div className="flex flex-wrap gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal />
                    更多操作
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>示例菜单</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => toast.info("已选择编辑")}>
                    <Settings className="mr-2 h-4 w-4" />
                    编辑信息
                  </DropdownMenuItem>
                  <DropdownMenuCheckboxItem
                    checked={enabled}
                    onCheckedChange={setEnabled}
                  >
                    接收通知
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Info />
                    快捷说明
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <h3 className="text-sm">轻量信息面板</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    适用于就地显示额外说明，点击外部即可关闭。
                  </p>
                </PopoverContent>
              </Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="通知提示">
                    <Bell />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>悬停或聚焦可查看提示</TooltipContent>
              </Tooltip>
            </div>
          </Demo>
          <Demo
            title="消息反馈 Sonner"
            description="成功、信息、错误和可撤销操作提示。"
          >
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => toast.success("保存成功")}>
                成功提示
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("有一条新消息")}
              >
                信息提示
              </Button>
              <Button
                variant="destructive"
                onClick={() => toast.error("操作失败，请重试")}
              >
                错误提示
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  toast("演示项已归档", {
                    action: {
                      label: "撤销",
                      onClick: () => toast.success("已撤销演示操作"),
                    },
                  })
                }
              >
                带操作提示
              </Button>
            </div>
          </Demo>
          <Demo title="提示条 Alert" description="常驻页面的说明与错误反馈。">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>提示信息</AlertTitle>
              <AlertDescription>
                所有示例使用项目内的统一组件。
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>错误状态示例</AlertTitle>
              <AlertDescription>
                请检查输入后重试。这是一条静态演示。
              </AlertDescription>
            </Alert>
          </Demo>
        </TabsContent>
        <TabsContent value="data" className="grid gap-6 lg:grid-cols-2">
          <Demo
            title="数据表格 Table"
            description="搜索、状态标签与空结果展示。"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="搜索示例项目"
                placeholder="搜索项目名称"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>项目</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>事项</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows
                  .filter((r) => r.name.includes(query))
                  .map((r) => (
                    <TableRow key={r.name}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.owner}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "已完成" ? "default" : "secondary"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.amount}</TableCell>
                    </TableRow>
                  ))}
                {!rows.some((r) => r.name.includes(query)) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      没有匹配的项目
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Demo>
          <Demo
            title="折叠面板 Accordion"
            description="单项展开，可收起，适合常见问题与分组说明。"
          >
            <Accordion type="single" collapsible defaultValue="one">
              {[
                [
                  "one",
                  "这些组件可以直接复用吗？",
                  "可以，组件统一位于 src/components/ui，业务页面按需组合使用。",
                ],
                [
                  "two",
                  "是否支持深色模式？",
                  "支持，组件使用项目主题变量，跟随顶部主题切换。",
                ],
                [
                  "three",
                  "下拉框应该使用哪种组件？",
                  "使用标准 Select 组件，与文章管理、通知管理保持一致。",
                ],
              ].map(([value, title, content]) => (
                <AccordionItem key={value} value={value}>
                  <AccordionTrigger>{title}</AccordionTrigger>
                  <AccordionContent>{content}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Demo>
          <Demo
            title="骨架屏 Skeleton"
            description="切换加载占位与实际内容，保持布局稳定。"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoading(!loading)}
            >
              {loading ? "显示内容" : "显示骨架屏"}
            </Button>
            {loading ? (
              <div className="space-y-4" aria-label="内容加载占位">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>UI</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">组件加载完成</p>
                    <p className="text-xs text-muted-foreground">
                      统一的内容占位模式
                    </p>
                  </div>
                </div>
                <div className="flex h-24 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                  <Check className="mr-2 h-4 w-4" />
                  这里展示实际内容
                </div>
              </div>
            )}
          </Demo>
          <Demo
            title="面包屑与滚动区域"
            description="Breadcrumb、Separator 与 ScrollArea。"
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>工作空间</BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>组件示例</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Separator />
            <ScrollArea className="h-48 rounded-md border">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0"
                >
                  <span>示例记录 {String(i + 1).padStart(2, "0")}</span>
                  <Badge variant="outline">已同步</Badge>
                </div>
              ))}
            </ScrollArea>
          </Demo>
        </TabsContent>
      </Tabs>
    </>
  );
}
