import { TrendingUp, ChevronRight, Eye, CalendarCheck } from "lucide-react";
import DormCard from "./DormCard";
import dorm1 from "@/assets/dorm1.jpg";
import dorm2 from "@/assets/dorm2.jpg";
import dorm3 from "@/assets/dorm3.jpg";
import dorm4 from "@/assets/dorm4.jpg";

const trending = [
  { image: dorm1, name: "The Hub Ratchada", location: "ใกล้ MRT รัชดา", rating: 4.7, reviews: 156, price: 5900, badge: "จองเยอะสุด", badgeType: "hot" as const, stat: "เดือนนี้มีคนจอง 156 ครั้ง", statIcon: CalendarCheck },
  { image: dorm2, name: "New Chapter Dorm", location: "ใกล้ ม.เกษตร บางเขน", rating: 4.9, reviews: 42, price: 4800, badge: "หอใหม่ล่าสุด", badgeType: "new" as const, stat: "เปิดใหม่ 2024", statIcon: CalendarCheck },
  { image: dorm3, name: "Urban Living", location: "ใกล้ BTS จ่อนบุรี", rating: 4.6, reviews: 312, price: 6900, badge: "คนดูเยอะ", badgeType: "hot" as const, stat: "ดูแล้ว 12,345 ครั้ง", statIcon: Eye },
  { image: dorm4, name: "Green Garden Place", location: "ใกล้ ม.ธรรมศาสตร์", rating: 4.5, reviews: 78, price: 3500, badge: "ราคาดี", badgeType: "promo" as const, stat: "ราคาถูกสุดในย่าน", statIcon: TrendingUp },
];

const TrendingSection = () => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">หอยอดนิยม / กำลังมาแรง</h3>
        </div>
        <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
          ดูหอมาทั้งหมด <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {trending.map((dorm) => (
          <div key={dorm.name} className="space-y-0">
            <DormCard
              image={dorm.image}
              name={dorm.name}
              location={dorm.location}
              rating={dorm.rating}
              reviews={dorm.reviews}
              price={dorm.price}
              badge={dorm.badge}
              badgeType={dorm.badgeType}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingSection;
