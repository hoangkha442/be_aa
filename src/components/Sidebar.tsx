import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  TriangleAlert,
  NotebookPen,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/auth/auth-context";
import { useActivePath } from "@/lib/isActivePath";

type Props = {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  mobile?: boolean;
  className?: string;
};

type NavItem = {
  to: string;
  label: string;
  icon: any;
  matchPrefix?: string;
};

const items: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/classes", label: "Lớp phụ trách", icon: GraduationCap },
  { to: "/students", label: "Sinh viên", icon: Users },

  { to: "/warnings", label: "Cảnh báo sớm", icon: TriangleAlert },
  { to: "/notes", label: "Ghi chú tư vấn", icon: NotebookPen },
  { to: "/reports", label: "Báo cáo", icon: FileText },
  { to: "/settings", label: "Cài đặt", icon: Settings },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobile = false, className }: Props) {
  const { logout } = useAuth();
  const { isActivePrefix } = useActivePath();
  const isCollapsed = mobile ? false : collapsed;

  return (
    <aside
      className={cn(
        "border-r bg-background",
        "h-full flex flex-col overflow-hidden",
        "transition-[width] duration-300 ease-in-out",
        mobile ? "w-full" : isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <TooltipProvider delayDuration={150}>
        <div className={cn(isCollapsed ? "p-1" : "p-3")}>
          <nav className={cn("flex flex-col", isCollapsed ? "justify-center space-y-1.5 mt-2" : "gap-1")}>
            {items.map((it) => {
              const Icon = it.icon;
              const active = isActivePrefix(it.matchPrefix ?? it.to);

              const link = (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={cn(
                    "h-10 rounded-md text-sm flex items-center",
                    "px-3 transition-colors",
                    isCollapsed ? "justify-center" : "gap-3",
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-slate-900 hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      isCollapsed ? "w-full flex justify-center py-2" : "",
                      active ? "text-slate-900" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                  </div>

                  <span
                    className={cn(
                      "truncate transition-opacity duration-200",
                      isCollapsed ? "opacity-0 w-0" : "opacity-100"
                    )}
                  >
                    {it.label}
                  </span>
                </NavLink>
              );

              if (!isCollapsed) return link;

              return (
                <Tooltip key={it.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="text-sm">
                    {it.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-3 pt-2">
          <Separator className="mb-3" />

          {!mobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn("w-full h-10", isCollapsed ? "px-0 justify-center" : "justify-start gap-2")}
                  onClick={onToggleCollapse}
                >
                  {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                  <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                    {isCollapsed ? "Mở rộng" : "Thu gọn"}
                  </span>
                </Button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Mở rộng menu</TooltipContent>}
            </Tooltip>
          )}

          <div className="mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-10 bg-slate-700 text-slate-100 hover:bg-slate-900 hover:text-slate-50 transition-all duration-300",
                    isCollapsed ? "px-0 justify-center" : "justify-start gap-2"
                  )}
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>
                    Đăng xuất
                  </span>
                </Button>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">Đăng xuất</TooltipContent>}
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </aside>
  );
}
