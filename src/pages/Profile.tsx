import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/stores/adminStore";
import { useAuthStore } from "@/stores/authStore";
import {
  AppIcon,
  IconPicker,
  Field,
  Heading,
  act,
} from "@/components/admin/shared";
export default function Profile() {
  const { profile, saveProfile } = useAdminStore();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState(profile);
  const update = (key: keyof typeof form, value: string) =>
    setForm({ ...form, [key]: value });
  return (
    <>
      <Heading
        title="个人资料"
        description="维护你的基本信息和个人头像，保存后同步到顶部账户入口。"
      />
      <div className="profile-layout grid min-w-0 grid-cols-1 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 rounded-2xl bg-primary/10 p-5 text-primary">
              <AppIcon name={form.avatar} className="h-10 w-10" />
            </div>
            <h2 className="text-xl">{form.displayName || "你的昵称"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              @{user?.username} · {user?.role}
            </p>
            <p className="mt-5 break-all text-sm text-muted-foreground">
              {form.bio || "添加一句个人介绍"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                act(() => saveProfile(form), "个人资料已保存");
              }}
            >
              <div className="space-y-2">
                <p className="text-sm font-medium">头像图标</p>
                <IconPicker
                  value={form.avatar}
                  onChange={(v) => update("avatar", v)}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="displayName" label="昵称">
                  <Input
                    id="displayName"
                    required
                    maxLength={40}
                    value={form.displayName}
                    onChange={(e) => update("displayName", e.target.value)}
                  />
                </Field>
                <Field id="profile-email" label="邮箱">
                  <Input
                    id="profile-email"
                    type="email"
                    required
                    maxLength={100}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </Field>
                <Field id="phone" label="联系电话（选填）">
                  <Input
                    id="phone"
                    type="tel"
                    maxLength={30}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </Field>
                <Field id="department" label="部门（选填）">
                  <Input
                    id="department"
                    maxLength={60}
                    value={form.department}
                    onChange={(e) => update("department", e.target.value)}
                  />
                </Field>
              </div>
              <Field id="bio" label="个人介绍">
                <Textarea
                  id="bio"
                  maxLength={200}
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                />
              </Field>
              <div className="flex gap-3">
                <Button type="submit">保存资料</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(profile)}
                >
                  重置修改
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
