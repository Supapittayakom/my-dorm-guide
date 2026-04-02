import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "รหัสผ่านไม่ตรงกัน", description: "กรุณากรอกรหัสผ่านให้ตรงกันทั้งสองช่อง", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "รหัสผ่านสั้นเกินไป", description: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLoading(false);
    if (error) {
      toast({ title: "สมัครสมาชิกไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "สมัครสมาชิกสำเร็จ!", description: "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี" });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex items-center gap-2 text-primary">
              <Building2 className="h-8 w-8" />
              <span className="text-2xl font-bold">DormBooking</span>
            </div>
            <CardTitle className="text-2xl">สมัครสมาชิก</CardTitle>
            <CardDescription>สร้างบัญชีเพื่อค้นหาและจองหอพัก</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อที่แสดง</Label>
                <Input id="name" placeholder="ชื่อของคุณ" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="อย่างน้อย 6 ตัวอักษร" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">ยืนยันรหัสผ่าน</Label>
                <Input id="confirm" type={showPassword ? "text" : "password"} placeholder="กรอกรหัสผ่านอีกครั้ง" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                สมัครสมาชิก
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                มีบัญชีแล้ว? <Link to="/login" className="text-primary hover:underline font-medium">เข้าสู่ระบบ</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
