import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CalendarCheck, Loader2, Check, X, Building2, Phone, MessageSquare } from "lucide-react";

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "⏳ รออนุมัติ", cls: "bg-amber-500" },
    approved: { label: "✅ อนุมัติแล้ว", cls: "bg-green-600" },
    rejected: { label: "❌ ปฏิเสธ", cls: "bg-destructive" },
    cancelled: { label: "🚫 ยกเลิก", cls: "bg-muted-foreground" },
    completed: { label: "🏁 สำเร็จ", cls: "bg-primary" },
  };
  const it = map[s] ?? { label: s, cls: "" };
  return <Badge className={it.cls}>{it.label}</Badge>;
};

const OwnerBookings = () => {
  const { user, roles, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isOwner = roles.includes("owner") || roles.includes("admin");

  const [actionDialog, setActionDialog] = useState<{ id: string; type: "approved" | "rejected" } | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["owner-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, dorms(id, name, thumbnail_url), profiles:user_id(display_name, avatar_url, phone)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isOwner,
  });

  const submitAction = async () => {
    if (!actionDialog) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: actionDialog.type, owner_note: note || null })
      .eq("id", actionDialog.id);
    setSubmitting(false);
    if (error) {
      toast({ title: "อัปเดตไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: actionDialog.type === "approved" ? "อนุมัติแล้ว ✅" : "ปฏิเสธแล้ว" });
      qc.invalidateQueries({ queryKey: ["owner-bookings"] });
      setActionDialog(null); setNote("");
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!isOwner) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">สำหรับเจ้าของหอเท่านั้น</h2>
        </div>
        <Footer />
      </>
    );
  }

  const filterBy = (s: string) => bookings?.filter((b: any) => b.status === s) ?? [];
  const all = bookings ?? [];

  const renderList = (list: any[]) => {
    if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!list.length) return (
      <div className="text-center py-16">
        <CalendarCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">ไม่มีรายการ</p>
      </div>
    );
    return (
      <div className="space-y-3">
        {list.map((b: any) => (
          <Card key={b.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{b.dorms?.name}</h3>
                    <p className="text-sm text-muted-foreground">โดย {b.profiles?.display_name ?? "ผู้ใช้"}</p>
                  </div>
                  {statusBadge(b.status)}
                </div>
                <p className="text-sm">📅 {new Date(b.check_in_date).toLocaleDateString("th-TH")} · {b.duration_months} เดือน · {b.room_type}</p>
                <p className="text-sm text-primary font-medium">฿{Number(b.monthly_price).toLocaleString()}/เดือน</p>
                {b.contact_phone && <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3" /> {b.contact_phone}</p>}
                {b.message && <p className="text-sm flex items-start gap-1"><MessageSquare className="h-3 w-3 mt-1 flex-shrink-0" /> {b.message}</p>}
                {b.owner_note && <p className="text-sm bg-muted/50 p-2 rounded">📝 {b.owner_note}</p>}
              </div>
              {b.status === "pending" && (
                <div className="flex sm:flex-col gap-2">
                  <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => setActionDialog({ id: b.id, type: "approved" })}>
                    <Check className="h-3 w-3" /> อนุมัติ
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => setActionDialog({ id: b.id, type: "rejected" })}>
                    <X className="h-3 w-3" /> ปฏิเสธ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">📨 คำขอจองหอ</h1>
        <p className="text-muted-foreground mb-6">จัดการคำขอจองที่เข้ามาทั้งหมด</p>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">รออนุมัติ ({filterBy("pending").length})</TabsTrigger>
            <TabsTrigger value="approved">อนุมัติ ({filterBy("approved").length})</TabsTrigger>
            <TabsTrigger value="rejected">ปฏิเสธ ({filterBy("rejected").length})</TabsTrigger>
            <TabsTrigger value="all">ทั้งหมด ({all.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">{renderList(filterBy("pending"))}</TabsContent>
          <TabsContent value="approved" className="mt-4">{renderList(filterBy("approved"))}</TabsContent>
          <TabsContent value="rejected" className="mt-4">{renderList(filterBy("rejected"))}</TabsContent>
          <TabsContent value="all" className="mt-4">{renderList(all)}</TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!actionDialog} onOpenChange={(o) => !o && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog?.type === "approved" ? "อนุมัติการจอง" : "ปฏิเสธการจอง"}</DialogTitle>
            <DialogDescription>เพิ่มข้อความถึงผู้จอง (ไม่บังคับ)</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder={actionDialog?.type === "approved" ? "เช่น ติดต่อกลับเพื่อเข้าชมห้อง..." : "เหตุผลที่ปฏิเสธ..."} value={note} onChange={(e) => setNote(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>ยกเลิก</Button>
            <Button onClick={submitAction} disabled={submitting} className={actionDialog?.type === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default OwnerBookings;
