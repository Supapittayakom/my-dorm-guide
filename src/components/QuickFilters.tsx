import { useState } from "react";
import { DollarSign, BedDouble, Snowflake, Car, PawPrint, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const QuickFilters = () => {
  const [priceRange, setPriceRange] = useState([2000, 8000]);
  const [roomType, setRoomType] = useState<string | null>(null);
  const [aircon, setAircon] = useState<string | null>(null);
  const [parking, setParking] = useState(false);
  const [pets, setPets] = useState(false);

  const reset = () => {
    setPriceRange([2000, 8000]);
    setRoomType(null);
    setAircon(null);
    setParking(false);
    setPets(false);
  };

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">ตัวกรองด่วน</h3>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> รีเซ็ตตัวกรอง
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-background border border-border rounded-2xl p-5 shadow-sm">
        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <DollarSign className="h-4 w-4 text-primary" /> ราคา / เดือน
          </div>
          <input
            type="range"
            min={1000}
            max={15000}
            step={500}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} บาท
          </p>
        </div>

        {/* Room type */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BedDouble className="h-4 w-4 text-primary" /> ประเภทห้อง
          </div>
          <div className="flex gap-2">
            <Button
              variant={roomType === "single" ? "filter-active" : "filter"}
              size="sm"
              onClick={() => setRoomType(roomType === "single" ? null : "single")}
            >
              เดี่ยว
            </Button>
            <Button
              variant={roomType === "shared" ? "filter-active" : "filter"}
              size="sm"
              onClick={() => setRoomType(roomType === "shared" ? null : "shared")}
            >
              รวม
            </Button>
          </div>
        </div>

        {/* Aircon */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Snowflake className="h-4 w-4 text-primary" /> แอร์ / พัดลม
          </div>
          <div className="flex gap-2">
            <Button
              variant={aircon === "ac" ? "filter-active" : "filter"}
              size="sm"
              onClick={() => setAircon(aircon === "ac" ? null : "ac")}
            >
              แอร์
            </Button>
            <Button
              variant={aircon === "fan" ? "filter-active" : "filter"}
              size="sm"
              onClick={() => setAircon(aircon === "fan" ? null : "fan")}
            >
              พัดลม
            </Button>
          </div>
        </div>

        {/* Parking */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Car className="h-4 w-4 text-primary" /> ที่จอดรถ
          </div>
          <Button
            variant={parking ? "filter-active" : "filter"}
            size="sm"
            onClick={() => setParking(!parking)}
          >
            มีที่จอดรถ
          </Button>
        </div>

        {/* Pets */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <PawPrint className="h-4 w-4 text-primary" /> เลี้ยงสัตว์ได้
          </div>
          <Button
            variant={pets ? "filter-active" : "filter"}
            size="sm"
            onClick={() => setPets(!pets)}
          >
            เลี้ยงได้
          </Button>
        </div>
      </div>
    </section>
  );
};

export default QuickFilters;
