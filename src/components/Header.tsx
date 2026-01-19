import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/auth/auth-context";
// import logo from "@/assets/vluAA.jpg";
import logows from "@/assets/vluAAwithoutSlogan.jpg";
export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="h-14 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>CVHT Management</SheetTitle>
              </SheetHeader>

              {/* Mobile sidebar: luôn expanded */}
              <div className="p-2">
                <Sidebar collapsed={false} mobile />
              </div>
            </SheetContent>
          </Sheet>

          {/* <div className="font-semibold">CVHT Management</div> */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className=" h-10 w-10">
              <img src={logows} className="w-full h-full" alt="Logo" />
            </div>
            <div className="flex flex-col font-semibold text-slate-900 tracking-wide mt-1">
              <p className="leading-4">Văn lang</p>
              <p>Academic Advisor</p>
            </div>
          </div>
        </div>

        {/* Right header: hiển thị tên user */}
        <div className="text-sm flex items-center gap-2">
          <span className="text-muted-foreground hidden sm:inline">
            Xin chào,
          </span>
          <span className="font-medium">{user?.role ?? "—"}</span>
        </div>
      </div>
    </header>
  );
}
