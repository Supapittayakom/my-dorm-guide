import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Image as ImageIcon, Save, Eye, EyeOff } from "lucide-react";

const dormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหอพัก").max(200),
  description: z.string().max(2000).optional(),
  price_min: z.coerce.number().min(0, "ราคาต้องมากกว่า 0"),
  price_max: z.coerce.number().min(0, "ราคาต้องมากกว่า 0"),
  room_type: z.enum(["single", "shared", "both"]),
  total_rooms: z.coerce.number().int().min(0),
  available_rooms: z.coerce.number().int().min(0),
  address: z.string().max(500).optional(),
  district: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  latitude: z.coerce.number().optional().or(z.literal("")),
  longitude: z.coerce.number().optional().or(z.literal("")),
  near_university: z.string().max(200).optional(),
  has_air_conditioning: z.boolean(),
  has_wifi: z.boolean(),
  has_parking: z.boolean(),
  has_pet_allowed: z.boolean(),
  has_furniture: z.boolean(),
  has_security: z.boolean(),
  has_cctv: z.boolean(),
  has_elevator: z.boolean(),
  has_laundry: z.boolean(),
  has_kitchen: z.boolean(),
});

type DormFormValues = z.infer<typeof dormSchema>;

interface DormFormProps {
  dormId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const DormForm = ({ dormId, onSuccess, onCancel }: DormFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!dormId);
  const [images, setImages] = useState<{ id?: string; url: string; file?: File }[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const form = useForm<DormFormValues>({
    resolver: zodResolver(dormSchema),
    defaultValues: {
      name: "",
      description: "",
      price_min: 0,
      price_max: 0,
      room_type: "single",
      total_rooms: 0,
      available_rooms: 0,
      address: "",
      district: "",
      province: "",
      near_university: "",
      has_air_conditioning: false,
      has_wifi: false,
      has_parking: false,
      has_pet_allowed: false,
      has_furniture: false,
      has_security: false,
      has_cctv: false,
      has_elevator: false,
      has_laundry: false,
      has_kitchen: false,
    },
  });

  useEffect(() => {
    if (dormId) {
      loadDorm(dormId);
    }
  }, [dormId]);

  const loadDorm = async (id: string) => {
    setInitialLoading(true);
    const { data: dorm } = await supabase.from("dorms").select("*").eq("id", id).single();
    if (dorm) {
      form.reset({
        name: dorm.name,
        description: dorm.description ?? "",
        price_min: dorm.price_min,
        price_max: dorm.price_max,
        room_type: dorm.room_type as "single" | "shared" | "both",
        total_rooms: dorm.total_rooms,
        available_rooms: dorm.available_rooms,
        address: dorm.address ?? "",
        district: dorm.district ?? "",
        province: dorm.province ?? "",
        latitude: dorm.latitude ?? ("" as any),
        longitude: dorm.longitude ?? ("" as any),
        near_university: dorm.near_university ?? "",
        has_air_conditioning: dorm.has_air_conditioning,
        has_wifi: dorm.has_wifi,
        has_parking: dorm.has_parking,
        has_pet_allowed: dorm.has_pet_allowed,
        has_furniture: dorm.has_furniture,
        has_security: dorm.has_security,
        has_cctv: dorm.has_cctv,
        has_elevator: dorm.has_elevator,
        has_laundry: dorm.has_laundry,
        has_kitchen: dorm.has_kitchen,
      });

      const { data: imgs } = await supabase
        .from("dorm_images")
        .select("*")
        .eq("dorm_id", id)
        .order("sort_order");
      if (imgs) setImages(imgs.map((i) => ({ id: i.id, url: i.image_url })));
    }
    setInitialLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (dormId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const img of images) {
      if (img.file) {
        const ext = img.file.name.split(".").pop();
        const path = `${user!.id}/${dormId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("dorm-images").upload(path, img.file);
        if (!error) {
          const { data } = supabase.storage.from("dorm-images").getPublicUrl(path);
          urls.push(data.publicUrl);
        }
      } else {
        urls.push(img.url);
      }
    }
    return urls;
  };

  const onSubmit = async (values: DormFormValues, status: "draft" | "published") => {
    if (!user) return;
    setLoading(true);

    try {
      const dormData = {
        name: values.name,
        description: values.description || null,
        price_min: values.price_min,
        price_max: values.price_max,
        room_type: values.room_type,
        total_rooms: values.total_rooms,
        available_rooms: values.available_rooms,
        address: values.address || null,
        district: values.district || null,
        province: values.province || null,
        latitude: typeof values.latitude === "number" ? values.latitude : null,
        longitude: typeof values.longitude === "number" ? values.longitude : null,
        near_university: values.near_university || null,
        has_air_conditioning: values.has_air_conditioning,
        has_wifi: values.has_wifi,
        has_parking: values.has_parking,
        has_pet_allowed: values.has_pet_allowed,
        has_furniture: values.has_furniture,
        has_security: values.has_security,
        has_cctv: values.has_cctv,
        has_elevator: values.has_elevator,
        has_laundry: values.has_laundry,
        has_kitchen: values.has_kitchen,
        status,
        owner_id: user.id,
      };

      let resultDormId = dormId;

      if (dormId) {
        const { error } = await supabase.from("dorms").update(dormData).eq("id", dormId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("dorms").insert(dormData).select("id").single();
        if (error) throw error;
        resultDormId = data.id;
      }

      // Upload images
      setUploadingImages(true);
      const imageUrls = await uploadImages(resultDormId!);

      // Delete old images and insert new
      await supabase.from("dorm_images").delete().eq("dorm_id", resultDormId!);
      if (imageUrls.length > 0) {
        await supabase.from("dorm_images").insert(
          imageUrls.map((url, i) => ({
            dorm_id: resultDormId!,
            image_url: url,
            sort_order: i,
          }))
        );
      }

      // Update thumbnail
      if (imageUrls.length > 0) {
        await supabase.from("dorms").update({ thumbnail_url: imageUrls[0] }).eq("id", resultDormId!);
      }

      setUploadingImages(false);

      toast({
        title: dormId ? "อัปเดตหอพักสำเร็จ" : "เพิ่มหอพักสำเร็จ",
        description: status === "draft" ? "บันทึกเป็นแบบร่าง" : "เผยแพร่เรียบร้อย",
      });

      onSuccess();
    } catch (err: any) {
      toast({ title: "เกิดข้อผิดพลาด", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const amenities = [
    { key: "has_air_conditioning" as const, label: "❄️ แอร์" },
    { key: "has_wifi" as const, label: "📶 WiFi" },
    { key: "has_parking" as const, label: "🚗 ที่จอดรถ" },
    { key: "has_pet_allowed" as const, label: "🐶 เลี้ยงสัตว์ได้" },
    { key: "has_furniture" as const, label: "🪑 เฟอร์นิเจอร์" },
    { key: "has_security" as const, label: "🔒 รปภ." },
    { key: "has_cctv" as const, label: "📷 CCTV" },
    { key: "has_elevator" as const, label: "🛗 ลิฟต์" },
    { key: "has_laundry" as const, label: "🧺 ซักรีด" },
    { key: "has_kitchen" as const, label: "🍳 ห้องครัว" },
  ];

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📝 ข้อมูลพื้นฐาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อหอพัก *</FormLabel>
                <FormControl><Input placeholder="เช่น หอพักสุขใจ" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>รายละเอียด</FormLabel>
                <FormControl><Textarea placeholder="อธิบายจุดเด่นของหอพัก..." rows={4} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="price_min" render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาเริ่มต้น (บาท/เดือน) *</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price_max" render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาสูงสุด (บาท/เดือน) *</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="room_type" render={({ field }) => (
              <FormItem>
                <FormLabel>ประเภทห้อง</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="single">ห้องเดี่ยว</SelectItem>
                    <SelectItem value="shared">ห้องรวม</SelectItem>
                    <SelectItem value="both">ทั้งสองแบบ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="total_rooms" render={({ field }) => (
                <FormItem>
                  <FormLabel>จำนวนห้องทั้งหมด</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="available_rooms" render={({ field }) => (
                <FormItem>
                  <FormLabel>ห้องว่าง</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📍 ที่ตั้ง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>ที่อยู่</FormLabel>
                <FormControl><Input placeholder="เลขที่ / ถนน / ซอย" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="district" render={({ field }) => (
                <FormItem>
                  <FormLabel>เขต/อำเภอ</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="province" render={({ field }) => (
                <FormItem>
                  <FormLabel>จังหวัด</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="near_university" render={({ field }) => (
              <FormItem>
                <FormLabel>มหาวิทยาลัยใกล้เคียง</FormLabel>
                <FormControl><Input placeholder="เช่น ม.ศิลปากร" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="latitude" render={({ field }) => (
                <FormItem>
                  <FormLabel>ละติจูด</FormLabel>
                  <FormControl><Input type="number" step="any" placeholder="13.xxxx" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="longitude" render={({ field }) => (
                <FormItem>
                  <FormLabel>ลองจิจูด</FormLabel>
                  <FormControl><Input type="number" step="any" placeholder="100.xxxx" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🏠 สิ่งอำนวยความสะดวก</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {amenities.map((item) => (
                <FormField key={item.key} control={form.control} name={item.key} render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">{item.label}</FormLabel>
                  </FormItem>
                )} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🖼 รูปภาพหอพัก</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded">
                      ภาพหลัก
                    </span>
                  )}
                </div>
              ))}
              <label className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">เพิ่มรูป</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {uploadingImages && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> กำลังอัปโหลดรูปภาพ...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0 bg-background py-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={form.handleSubmit((v) => onSubmit(v, "draft"))}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            บันทึกแบบร่าง
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={form.handleSubmit((v) => onSubmit(v, "published"))}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            เผยแพร่หอพัก
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DormForm;
