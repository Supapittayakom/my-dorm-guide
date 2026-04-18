import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, Loader2, X, Building2 } from "lucide-react";

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

const MyBookings = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, dorms(id, name, thumbnail_url, district, province)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const cancel = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) toast({ title: "ยกเลิกไม่สำเร็จ", description: error.message, variant: "destructive" });
    else { toast({ title: "ยกเลิกการจองแล้ว" }); qc.invalidateQueries({ queryKey: ["my-bookings"] }); }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">📋 การจองของฉัน</h1>
        <p className="text-muted-foreground mb-6">รายการคำขอจองหอพักทั้งหมด</p>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !bookings?.length ? (
          <div className="text-center py-20">
            <CalendarCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">ยังไม่มีการจอง</h3>
            <p className="text-muted-foreground">เริ่มค้นหาหอพักที่ใช่และส่งคำขอจองได้เลย</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => (
              <Card key={b.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-32 h-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {b.dorms?.thumbnail_url ? (
                      <img src={b.dorms.thumbnail_url} alt={b.dorms.name} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center"><Building2 className="h-8 w-8 text-muted-foreground" /></div>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg">{b.dorms?.name ?? "หอพัก"}</h3>
                      {statusBadge(b.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">📍 {[b.dorms?.district, b.dorms?.province].filter(Boolean).join(", ") || "—"}</p>
                    <p className="text-sm">📅 เข้าอยู่ {new Date(b.check_in_date).toLocaleDateString("th-TH")} · {b.duration_months} เดือน</p>
                    <p className="text-sm text-primary font-medium">฿{Number(b.monthly_price).toLocaleString()}/เดือน · รวม ฿{(Number(b.monthly_price) * b.duration_months).toLocaleString()}</p>
                    {b.owner_note && <p className="text-sm bg-muted/50 p-2 rounded mt-2">💬 เจ้าของ: {b.owner_note}</p>}
                  </div>
                  {b.status === "pending" && (
                    <Button variant="outline" size="sm" className="self-start gap-1" onClick={() => cancel(b.id)}>
                      <X className="h-3 w-3" /> ยกเลิก
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyBookings;
