import { Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-7 w-7" />
              <div>
                <h4 className="text-lg font-bold">DormBooking</h4>
                <p className="text-xs opacity-70">หาง่าย จองไว ได้หอดีใช้</p>
              </div>
            </div>
            <p className="text-sm opacity-60">© 2024 DormBooking. All rights reserved.</p>
          </div>

          {/* Menu */}
          <div>
            <h5 className="font-semibold mb-3">เมนู</h5>
            <ul className="space-y-2 text-sm opacity-70">
              <li className="hover:opacity-100 cursor-pointer transition">หน้าแรก</li>
              <li className="hover:opacity-100 cursor-pointer transition">หอพักทั้งหมด</li>
              <li className="hover:opacity-100 cursor-pointer transition">สำหรับเจ้าของหอ</li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h5 className="font-semibold mb-3">ช่วยเหลือ</h5>
            <ul className="space-y-2 text-sm opacity-70">
              <li className="hover:opacity-100 cursor-pointer transition">วิธีการใช้งาน</li>
              <li className="hover:opacity-100 cursor-pointer transition">คำถามที่พบบ่อย</li>
              <li className="hover:opacity-100 cursor-pointer transition">ติดต่อเรา</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="font-semibold mb-3">รับโปรโมชั่นหอพักดีๆ ก่อนใคร</h5>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                className="flex-1 h-10 px-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary-foreground/40"
              />
              <Button variant="hero" size="sm" className="shrink-0 gap-1">
                <Mail className="h-4 w-4" /> สมัคร
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between text-xs opacity-50">
          <span>นโยบายความเป็นส่วนตัว</span>
          <span>ข้อกำหนดการใช้งาน</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
