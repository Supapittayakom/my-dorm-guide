import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Star, MapPin, Navigation, Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons
const createDormIcon = (isActive: boolean) =>
  L.divIcon({
    className: "custom-dorm-marker",
    html: `<div class="${isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110" : "bg-card text-foreground border border-border shadow-lg hover:shadow-xl"} rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });

const createPriceIcon = (price: number, isActive: boolean) =>
  L.divIcon({
    className: "custom-price-marker",
    html: `<div class="${isActive ? "bg-primary text-primary-foreground ring-2 ring-primary/30 scale-110" : "bg-card text-foreground border border-border shadow-md hover:shadow-lg"} rounded-lg px-2 py-1 text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer">
      ฿${price.toLocaleString()}
    </div>`,
    iconSize: [80, 28],
    iconAnchor: [40, 28],
    popupAnchor: [0, -30],
  });

// Map controller for programmatic actions
function MapController({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

// Fit bounds to all markers
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (positions.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(positions.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      fitted.current = true;
    }
  }, [positions, map]);
  return null;
}

export interface DormMapItem {
  id: number;
  image: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  badgeType?: "hot" | "new" | "promo";
  lat: number;
  lng: number;
}

interface DormMapViewProps {
  dorms: DormMapItem[];
  loading?: boolean;
  highlightedId?: number | null;
  onDormSelect?: (id: number) => void;
  onDormHover?: (id: number | null) => void;
  className?: string;
  mode?: "full" | "hybrid";
}

const DormMapView = ({
  dorms,
  loading = false,
  highlightedId = null,
  onDormSelect,
  onDormHover,
  className = "",
  mode = "full",
}: DormMapViewProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [flyTo, setFlyTo] = useState<{ center: [number, number]; zoom: number } | null>(null);

  // Default center: Bangkok area
  const defaultCenter: [number, number] = [13.85, 100.52];

  const positions = useMemo(
    () => dorms.map((d) => [d.lat, d.lng] as [number, number]),
    [dorms]
  );

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setFlyTo({ center: loc, zoom: 14 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (loading) {
    return (
      <div className={`bg-card border border-border rounded-xl flex items-center justify-center ${mode === "full" ? "h-[600px]" : "h-full"} ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    );
  }

  if (dorms.length === 0) {
    return (
      <div className={`bg-card border border-border rounded-xl flex items-center justify-center ${mode === "full" ? "h-[600px]" : "h-full"} ${className}`}>
        <div className="text-center p-8">
          <SearchX className="h-16 w-16 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-lg font-semibold text-foreground">ไม่พบหอในบริเวณนี้</p>
          <p className="text-sm text-muted-foreground mt-1">ลองเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${mode === "full" ? "h-[600px]" : "h-full"} ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds positions={positions} />
        {flyTo && <MapController center={flyTo.center} zoom={flyTo.zoom} />}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={L.divIcon({
              className: "user-location-marker",
              html: `<div class="relative"><div class="w-4 h-4 bg-primary rounded-full border-2 border-primary-foreground shadow-lg"></div><div class="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-30"></div></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          />
        )}

        {/* Dorm markers */}
        {dorms.map((dorm) => (
          <Marker
            key={dorm.id}
            position={[dorm.lat, dorm.lng]}
            icon={createPriceIcon(dorm.price, highlightedId === dorm.id)}
            eventHandlers={{
              click: () => onDormSelect?.(dorm.id),
              mouseover: () => onDormHover?.(dorm.id),
              mouseout: () => onDormHover?.(null),
            }}
          >
            <Popup maxWidth={280} className="dorm-popup">
              <div className="flex gap-3 p-1 min-w-[240px]">
                <img
                  src={dorm.image}
                  alt={dorm.name}
                  className="w-20 h-20 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground truncate">{dorm.name}</h4>
                  <p className="text-primary font-bold text-sm mt-0.5">
                    ฿{dorm.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/เดือน</span>
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="h-3 w-3 fill-[hsl(45,93%,47%)] text-[hsl(45,93%,47%)]" />
                    <span className="text-xs font-medium">{dorm.rating}</span>
                    <span className="text-xs text-muted-foreground">({dorm.reviews})</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" /> {dorm.distance}
                  </p>
                  {dorm.badge && (
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      dorm.badgeType === "hot" ? "bg-[hsl(15,90%,55%)] text-white" :
                      dorm.badgeType === "new" ? "bg-[hsl(145,65%,42%)] text-white" :
                      "bg-[hsl(350,85%,55%)] text-white"
                    }`}>
                      {dorm.badge}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className="w-full mt-2 text-xs h-8"
                onClick={() => onDormSelect?.(dorm.id)}
              >
                ดูรายละเอียด →
              </Button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map controls overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        {/* Locate me button */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 bg-card shadow-lg border-border"
          onClick={handleLocate}
          disabled={locating}
          title="ตำแหน่งของฉัน"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Result count overlay */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-sm font-semibold text-foreground">
            พบ <span className="text-primary">{dorms.length}</span> หอในพื้นที่นี้
          </p>
        </div>
      </div>
    </div>
  );
};

export default DormMapView;
