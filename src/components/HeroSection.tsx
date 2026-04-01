import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-dorm.jpg";

const slides = [
  {
    title: "ค้นหาหอพัก\nที่ใช่ ใกล้มหาลัยคุณ",
    subtitle: "มีหอพักให้เลือกมากกว่า 3,000+ แห่ง\nค้นหา เปรียบเทียบ จองได้ในที่เดียว",
    promo: "จองหอวันนี้ รับส่วนลด 10%",
    image: heroImg,
  },
];

const HeroSection = () => {
  const [current] = useState(0);
  const slide = slides[current];

  return (
    <section className="relative w-full h-[400px] md:h-[460px] overflow-hidden">
      <img src={slide.image} alt="หอพัก" className="absolute inset-0 w-full h-full object-cover" width={1920} height={800} />
      <div className="absolute inset-0" style={{ background: "var(--hero-gradient)", opacity: 0.75 }} />
      
      <div className="relative container mx-auto h-full flex items-center px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-6">
          {/* Left Text */}
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground leading-tight whitespace-pre-line">
              {slide.title}
            </h2>
            <p className="mt-3 text-primary-foreground/80 text-sm md:text-base whitespace-pre-line">
              {slide.subtitle}
            </p>
            <Button variant="hero" size="lg" className="mt-6">
              ดูหอทั้งหมด
            </Button>
          </div>

          {/* Promo Card */}
          <div className="bg-background/95 backdrop-blur rounded-xl p-6 shadow-lg max-w-xs">
            <span className="badge-promo">โปรโมชั่นพิเศษ!</span>
            <p className="mt-3 text-2xl font-bold text-foreground">
              จองหอวันนี้<br />รับส่วนลด <span className="text-primary">10%</span>
            </p>
            <Button className="mt-4 w-full">ดูโปรทั้งหมด</Button>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 shadow hover:bg-background transition">
        <ChevronLeft className="h-6 w-6 text-foreground" />
      </button>
      <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 shadow hover:bg-background transition">
        <ChevronRight className="h-6 w-6 text-foreground" />
      </button>
    </section>
  );
};

export default HeroSection;
