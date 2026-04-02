import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
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
            <CardTitle className="text-2xl">ลืมรหัสผ่าน</CardTitle>
            <CardDescription>กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</CardDescription>
          </CardHeader>
          {sent ? (
            <CardContent className="text-center space-y-4 pb-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">ส่งอีเมลเรียบร้อยแล้ว!</h3>
                <p className="text-muted-foreground text-sm mt-1">กรุณาตรวจสอบอีเมล <strong>{email}</strong> เพื่อรีเซ็ตรหัสผ่าน</p>
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <Link to="/login"><ArrowLeft className="h-4 w-4" /> กลับหน้าเข้าสู่ระบบ</Link>
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  ส่งลิงก์รีเซ็ต
                </Button>
                <Link to="/login" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> กลับหน้าเข้าสู่ระบบ
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
