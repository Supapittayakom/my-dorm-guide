import { Home, Building2, FileEdit, Bell, Heart, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-primary leading-tight">DormBooking</h1>
            <p className="text-[10px] text-muted-foreground leading-none">หาง่าย จองไว ได้หอดีใช้</p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Button variant="ghost" className="gap-2 font-medium">
            <Home className="h-4 w-4" /> หน้าแรก
          </Button>
          <Button variant="ghost" className="gap-2 font-medium">
            <Building2 className="h-4 w-4" /> หอพัก
          </Button>
          <Button variant="outline" className="gap-2 font-medium">
            <FileEdit className="h-4 w-4" /> ลงประกาศหอพัก (สำหรับเจ้าของ)
          </Button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">3</span>
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Heart className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">4</span>
          </Button>
          <Button variant="outline" className="hidden sm:flex gap-2">
            <LogIn className="h-4 w-4" /> เข้าสู่ระบบ
          </Button>
          <Button className="hidden sm:flex gap-2">
            <User className="h-4 w-4" /> สมัครสมาชิก
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
