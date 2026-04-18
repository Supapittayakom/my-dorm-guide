import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CalendarCheck, Loader2 } from "lucide-react";

interface Props {
  dormId: string;
  dormName: string;
  ownerId: string;
  priceMin: number;
  defaultRoomType?: string;
  trigger?: React.ReactNode;
}

const BookingDialog = ({ dormId, dormName, ownerId, priceMin, defaultRoomType = "single", trigger }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [roomType, setRoomType] = useState(defaultRoomType);
  const [checkIn, setCheckIn] = useState("");
  const [duration, setDuration] = useState("6");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "กรุณาเข้าสู่ระบบก่อนจอง", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (user.id === ownerId) {
      toast({ title: "ไม่สามารถจองหอของตัวเอง", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("bookings").insert({
      dorm_id: dormId,
      user_id: user.id,
      owner_id: ownerId,
      room_type: roomType,
      check_in_date: checkIn,
      duration_months: parseInt(duration),
      monthly_price: priceMin,
      contact_phone: phone || null,
      message: message || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: "จองไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ส่งคำขอจองสำเร็จ ✅", description: "รอเจ้าของหอตรวจสอบและอนุมัติ" });
      setOpen(false);
      setCheckIn(""); setMessage(""); setPhone("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <CalendarCheck className="h-4 w-4" /> จองเลย
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>📅 จองห้อง — {dormName}</DialogTitle>
          <DialogDescription>กรอกข้อมูลเพื่อส่งคำขอจองให้เจ้าของหอ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>ประเภทห้อง</Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">ห้องเดี่ยว</SelectItem>
                <SelectItem value="shared">ห้องรวม</SelectItem>
                <SelectItem value="studio">สตูดิโอ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="checkin">วันเข้าอยู่</Label>
              <Input id="checkin" type="date" required min={new Date().toISOString().split("T")[0]} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ระยะเวลา (เดือน)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 3, 6, 12, 24].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m} เดือน</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์ติดต่อ</Label>
            <Input id="phone" type="tel" placeholder="0812345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="msg">ข้อความถึงเจ้าของ (ไม่บังคับ)</Label>
            <Textarea id="msg" rows={3} placeholder="เช่น สนใจเข้าชมก่อน, ขอดูห้องตัวจริง..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <div className="flex justify-between"><span>ค่าเช่า/เดือน</span><span>฿{priceMin.toLocaleString()}</span></div>
            <div className="flex justify-between font-semibold text-primary mt-1">
              <span>รวม {duration} เดือน</span>
              <span>฿{(priceMin * parseInt(duration || "0")).toLocaleString()}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
              ส่งคำขอจอง
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
