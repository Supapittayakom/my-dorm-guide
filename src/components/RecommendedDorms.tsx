import { ChevronRight, Sparkles } from "lucide-react";
import DormCard from "./DormCard";
import dorm1 from "@/assets/dorm1.jpg";
import dorm2 from "@/assets/dorm2.jpg";
import dorm3 from "@/assets/dorm3.jpg";
import dorm4 from "@/assets/dorm4.jpg";

const dorms = [
  { image: dorm1, name: "The Campus Life", location: "ใกล้ ม.เชียงใหม่", distance: "450 ม.", rating: 4.8, reviews: 124, price: 5500, badge: "รีวิวสูง", badgeType: "hot" as const },
  { image: dorm2, name: "S-Space Residence", location: "ใกล้ ม.เชียงใหม่", distance: "800 ม.", rating: 4.6, reviews: 89, price: 4500, badge: "คนดูเยอะ", badgeType: "new" as const },
  { image: dorm3, name: "Baan Smile Dorm", location: "ใกล้ ม.แม่โจ้", distance: "1.2 กม.", rating: 4.5, reviews: 56, price: 3900, originalPrice: 4200, badge: "เร่งองโปรโมต", badgeType: "promo" as const },
  { image: dorm4, name: "Prime Place", location: "ใกล้ ม.เชียงใหม่", distance: "1.5 กม.", rating: 4.7, reviews: 203, price: 6200 },
];

const RecommendedDorms = () => {
  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-foreground">หอแนะนำสำหรับคุณ</h3>
          <span className="badge-ai flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> แนะนำโดยระบบ AI
          </span>
        </div>
        <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          ดูทั้งหมด <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dorms.map((dorm) => (
          <DormCard key={dorm.name} {...dorm} />
        ))}
      </div>
    </section>
  );
};

export default RecommendedDorms;
