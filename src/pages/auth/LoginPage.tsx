import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk } from "@/store/slices/authSlice";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const { status, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(loginThunk({ email, password }));
    if ((res as any).meta?.requestStatus === "fulfilled") {
      const to = loc.state?.from ?? "/dashboard";
      nav(to, { replace: true });
    }
  };

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2 h-100vh overflow-hidden">
      {/* Left branding / message */}
      <div className="hidden lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-md">
          <div className="mb-4 inline-flex items-center  gap-2 rounded-full border bg-white/60 px-3 py-1 text-xs text-balance shadow-sm">
            <span className="h-2 w-2 rounded-full bg-slate-800" />
            Hệ thống Cố vấn học tập
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Quản lý học tập rõ ràng
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Truy cập dashboard theo lớp, xem cảnh báo học vụ, ghi chú tư vấn và theo dõi tiến độ sinh viên trong môi trường
            làm việc trang trọng, hiện đại.
          </p>

          <div className="mt-6 rounded-lg border bg-white/70 p-4 text-sm text-slate-700 shadow-sm">
            <div className="font-medium text-slate-900">Gợi ý</div>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground">
              <li>Dùng email cơ quan để đăng nhập</li>
              <li>Phiên đăng nhập tự refresh bằng refresh token</li>
              <li>Role ADVISOR/ADMIN mới truy cập hệ thống cố vấn</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right login card */}
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin để truy cập hệ thống cố vấn học tập
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten@vanlanguni.edu.vn"
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <button
                    type="button"
                    className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    onClick={() => alert("Tính năng quên mật khẩu sẽ bổ sung sau")}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {String(error)}
                </div>
              )}

              <Button type="submit" disabled={status === "loading"} className="w-full cursor-pointer">
                {status === "loading" ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Bằng việc đăng nhập, bạn đồng ý tuân thủ quy định sử dụng hệ thống.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
