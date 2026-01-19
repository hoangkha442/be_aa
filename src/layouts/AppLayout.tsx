import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("cvht_sidebar_collapsed") === "1";
  });

  useEffect(() => {
    localStorage.setItem("cvht_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    // khóa chiều cao viewport + chặn scroll toàn page
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header chiếm cố định */}
      <div className="shrink-0">
        <Header />
      </div>

      {/* phần dưới header chiếm hết còn lại, và không nở theo content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          className="hidden md:flex"
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />

        {/* chỉ main được phép scroll */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
