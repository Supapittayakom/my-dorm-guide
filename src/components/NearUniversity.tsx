import { useState } from "react";
import { GraduationCap, MapPin, Star, ChevronRight } from "lucide-react";
import dorm1 from "@/assets/dorm1.jpg";
import dorm2 from "@/assets/dorm2.jpg";
import dorm3 from "@/assets/dorm3.jpg";

const universities = [
  "มหาวิทยาลัยเชียงใหม่",
  "มหาวิทยาลัยเกษตรศาสตร์",
  "จุฬาลงกรณ์มหาวิทยาลัย",
  "มหาวิทยาลัยธรรมศาสตร์",
  "มหาวิทยาลัยมหิดล",
];

const nearbyDorms = [
  { image: dorm1, name: "The Campus Life", distance: "450 ม.", walkTime: "เดิน 6 นาที", rating: 4.8, price: 5500 },
  { image: dorm2, name: "S-Space Residence", distance: "800 ม.", walkTime: "เดิน 10 นาที", rating: 4.6, price: 4500 },
  { image: dorm3, name: "CM Dormitory", distance: "1.2 กม.", walkTime: "ขับรถ 3 นาที", rating: 4.4, price: 3800 },
];

const NearUniversity = () => {
  const [selectedUni, setSelectedUni] = useState(universities[0]);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">หอใกล้มหาวิทยาลัย</h3>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        {/* University Select */}
        <div className="mb-5">
          <label className="text-sm text-muted-foreground mb-2 block">เลือกมหาวิทยาลัย</label>
          <select
            value={selectedUni}
            onChange={(e) => setSelectedUni(e.target.value)}
            className="w-full max-w-sm h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {universities.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Dorm List */}
        <div className="space-y-3">
          {nearbyDorms.map((dorm) => (
            <div
              key={dorm.name}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition cursor-pointer"
            >
              <img
                src={dorm.image}
                alt={dorm.name}
                loading="lazy"
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm">{dorm.name}</h4>
                <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {dorm.walkTime}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{dorm.distance}</p>
                <div className="flex items-center gap-1 justify-end">
                  <Star className="h-3 w-3 fill-star text-star" />
                  <span className="text-xs font-medium text-foreground">{dorm.rating}</span>
                </div>
                <p className="text-sm font-bold text-primary">{dorm.price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">บาท/เดือน</span></p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2.5 text-sm font-medium text-primary border border-primary rounded-xl hover:bg-secondary transition flex items-center justify-center gap-1">
          ดูหอใกล้ {selectedUni} ทั้งหมด <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};

export default NearUniversity;
