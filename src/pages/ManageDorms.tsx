import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DormForm from "@/components/DormForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Building2, Loader2, ImageIcon,
} from "lucide-react";

const ManageDorms = () => {
  const { user, roles, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingDormId, setEditingDormId] = useState<string | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isOwnerOrAdmin = roles.includes("owner") || roles.includes("admin");

  const { data: dorms, isLoading } = useQuery({
    queryKey: ["my-dorms", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dorms")
        .select("*, dorm_images(id, image_url, sort_order)")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isOwnerOrAdmin,
  });

  const handleDelete = async () => {
    if (!deleteDialogId) return;
    setDeleting(true);
    const { error } = await supabase.from("dorms").delete().eq("id", deleteDialogId);
    if (error) {
      toast({ title: "ลบไม่สำเร็จ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "ลบหอพักสำเร็จ" });
      queryClient.invalidateQueries({ queryKey: ["my-dorms"] });
    }
    setDeleting(false);
    setDeleteDialogId(null);
  };

  const toggleStatus = async (dormId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase.from("dorms").update({ status: newStatus }).eq("id", dormId);
    if (!error) {
      toast({ title: newStatus === "published" ? "เผยแพร่แล้ว" : "ซ่อนแล้ว" });
      queryClient.invalidateQueries({ queryKey: ["my-dorms"] });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isOwnerOrAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">สำหรับเจ้าของหอเท่านั้น</h2>
          <p className="text-muted-foreground">กรุณาติดต่อ Admin เพื่อขอสิทธิ์เจ้าของหอ</p>
        </div>
        <Footer />
      </>
    );
  }

  if (showForm || editingDormId) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">
            {editingDormId ? "✏️ แก้ไขหอพัก" : "➕ เพิ่มหอพักใหม่"}
          </h2>
          <DormForm
            dormId={editingDormId ?? undefined}
            onSuccess={() => {
              setShowForm(false);
              setEditingDormId(null);
              queryClient.invalidateQueries({ queryKey: ["my-dorms"] });
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingDormId(null);
            }}
          />
        </div>
        <Footer />
      </>
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 hover:bg-green-600">เผยแพร่</Badge>;
      case "draft":
        return <Badge variant="secondary">แบบร่าง</Badge>;
      case "archived":
        return <Badge variant="outline">เก็บถาวร</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">🏢 จัดการหอพัก</h1>
            <p className="text-muted-foreground mt-1">เพิ่ม แก้ไข และจัดการหอพักของคุณ</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> เพิ่มหอพัก
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !dorms?.length ? (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">ยังไม่มีหอพัก</h3>
            <p className="text-muted-foreground mb-6">เริ่มเพิ่มหอพักเพื่อให้ผู้เช่าค้นหาได้</p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> เพิ่มหอพักแรก
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dorms.map((dorm) => (
              <Card key={dorm.id} className="overflow-hidden group">
                <div className="relative h-48 bg-muted">
                  {dorm.thumbnail_url ? (
                    <img src={dorm.thumbnail_url} alt={dorm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">{statusBadge(dorm.status)}</div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                      🖼 {(dorm.dorm_images as any[])?.length ?? 0} รูป
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate">{dorm.name}</h3>
                  <p className="text-primary font-medium">
                    ฿{dorm.price_min.toLocaleString()} - ฿{dorm.price_max.toLocaleString()}/เดือน
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dorm.district && dorm.province ? `${dorm.district}, ${dorm.province}` : dorm.province ?? "ไม่ระบุที่ตั้ง"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    🏠 {dorm.available_rooms}/{dorm.total_rooms} ห้องว่าง
                  </p>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setEditingDormId(dorm.id)}>
                      <Pencil className="h-3 w-3" /> แก้ไข
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => toggleStatus(dorm.id, dorm.status)}
                    >
                      {dorm.status === "published" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setDeleteDialogId(dorm.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบหอพัก</DialogTitle>
            <DialogDescription>
              การลบหอพักจะลบข้อมูลทั้งหมดรวมถึงรูปภาพ ไม่สามารถกู้คืนได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogId(null)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              ลบหอพัก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default ManageDorms;
