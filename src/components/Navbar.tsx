import { Home, Building2, FileEdit, Bell, Heart, User, LogIn, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const { user, profile, roles, loading, signOut } = useAuth();

  const getRoleBadge = () => {
    if (roles.includes("admin")) return <Badge variant="destructive" className="text-[10px]">Admin</Badge>;
    if (roles.includes("owner")) return <Badge className="text-[10px] bg-amber-500">เจ้าของหอ</Badge>;
    return null;
  };

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
          <Button variant="ghost" className="gap-2 font-medium" asChild>
            <Link to="/"><Home className="h-4 w-4" /> หน้าแรก</Link>
          </Button>
          <Button variant="ghost" className="gap-2 font-medium" asChild>
            <Link to="/listing"><Building2 className="h-4 w-4" /> หอพัก</Link>
          </Button>
          {user && (roles.includes("owner") || roles.includes("admin")) && (
            <Button variant="outline" className="gap-2 font-medium" asChild>
              <Link to="/manage-dorms"><FileEdit className="h-4 w-4" /> จัดการหอพัก</Link>
            </Button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">3</span>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {(profile?.display_name ?? user.email ?? "U")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                      {profile?.display_name ?? user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.display_name ?? "ผู้ใช้"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="mt-1">{getRoleBadge()}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><User className="h-4 w-4 mr-2" /> โปรไฟล์</DropdownMenuItem>
                  <DropdownMenuItem><Heart className="h-4 w-4 mr-2" /> รายการโปรด</DropdownMenuItem>
                  <DropdownMenuItem><Bell className="h-4 w-4 mr-2" /> การแจ้งเตือน</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => signOut()}>
                    <LogOut className="h-4 w-4 mr-2" /> ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" className="hidden sm:flex gap-2" asChild>
                <Link to="/login"><LogIn className="h-4 w-4" /> เข้าสู่ระบบ</Link>
              </Button>
              <Button className="hidden sm:flex gap-2" asChild>
                <Link to="/register"><User className="h-4 w-4" /> สมัครสมาชิก</Link>
              </Button>
              {/* Mobile login */}
              <Button variant="ghost" size="icon" className="sm:hidden" asChild>
                <Link to="/login"><LogIn className="h-5 w-5" /></Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
