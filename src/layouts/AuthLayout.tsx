import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-b from-slate-50 via-white to-slate-50" />
        <div className="absolute left-1/2 -top-55 h-130 w-130 -translate-x-1/2 rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <Outlet />
      </div>

      <footer className="pb-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Academic Advisor System
      </footer>
    </div>
  );
}
