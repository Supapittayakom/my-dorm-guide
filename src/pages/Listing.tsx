import { useState, useMemo, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, LayoutGrid, Map, SlidersHorizontal, X, Home, SearchX, RotateCcw, Star, ArrowUpDown, ChevronDown, Clock, Loader2,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Highlight keyword helper ───
const HighlightText = ({ text, keyword }: { text: string; keyword: string }) => {
  if (!keyword || !text) return <>{text}</>;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// ─── Recent searches (localStorage) ───
const RECENT_KEY = "dorm_recent_searches";
const getRecent = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5); }
  catch { return []; }
};
const saveRecent = (q: string) => {
  if (!q.trim()) return;
  const list = getRecent().filter((s) => s !== q.trim());
  list.unshift(q.trim());
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
};

// ─── Suggestion data ───
const suggestionData = [
  "ม.เกษตรศาสตร์", "ม.ศิลปากร", "ม.ธรรมศาสตร์", "ม.มหิดล", "จุฬาลงกรณ์",
  "ลาดพร้าว", "สยาม", "ศรีราชา", "เชียงใหม่",
  "Green View Residence", "Campus Place", "Sukjai Apartment", "Cozy Home",
  "Happy Dorm", "The Nine Place", "Baan Sabai", "Loft Studio 88",
  "PJ Mansion", "City Dorm Plus", "River Side Room", "Premium Suite",
];

import dorm1 from "@/assets/dorm1.jpg";
import dorm2 from "@/assets/dorm2.jpg";
import dorm3 from "@/assets/dorm3.jpg";
import dorm4 from "@/assets/dorm4.jpg";

const DormMapView = lazy(() => import("@/components/DormMapView"));

// Mock data
const allDorms = [
  { id: 1, image: dorm1, name: "Green View Residence", location: "ใกล้ ม.ศิลปากร", distance: "500 ม.", rating: 4.6, reviews: 150, price: 4500, badge: "ยอดนิยม", badgeType: "hot" as const, roomType: "single", amenities: ["air", "wifi", "parking"], pets: false, nearBTS: false, lat: 13.8199, lng: 100.0413 },
  { id: 2, image: dorm2, name: "Campus Place", location: "ใกล้ ม.ศิลปากร", distance: "300 ม.", rating: 4.5, reviews: 95, price: 3200, badge: "ใหม่", badgeType: "new" as const, roomType: "single", amenities: ["air", "wifi"], pets: false, nearBTS: true, lat: 13.8215, lng: 100.0435 },
  { id: 3, image: dorm3, name: "Sukjai Apartment", location: "ใกล้ ม.ศิลปากร", distance: "800 ม.", rating: 4.2, reviews: 80, price: 2800, originalPrice: 3200, badge: "ลดราคา", badgeType: "promo" as const, roomType: "shared", amenities: ["fan", "wifi"], pets: true, nearBTS: false, lat: 13.8175, lng: 100.0380 },
  { id: 4, image: dorm4, name: "Cozy Home", location: "ใกล้ ม.ศิลปากร", distance: "600 ม.", rating: 4.7, reviews: 120, price: 5000, roomType: "single", amenities: ["air", "wifi", "parking", "furniture", "fitness"], pets: false, nearBTS: true, lat: 13.8230, lng: 100.0450 },
  { id: 5, image: dorm1, name: "Happy Dorm", location: "ใกล้ ม.เกษตร", distance: "200 ม.", rating: 4.8, reviews: 200, price: 3800, badge: "ยอดนิยม", badgeType: "hot" as const, roomType: "single", amenities: ["air", "wifi", "furniture"], pets: true, nearBTS: true, lat: 13.8478, lng: 100.5696 },
  { id: 6, image: dorm2, name: "The Nine Place", location: "ใกล้ ม.เกษตร", distance: "450 ม.", rating: 4.3, reviews: 65, price: 4200, roomType: "shared", amenities: ["air", "parking"], pets: false, nearBTS: false, lat: 13.8495, lng: 100.5720 },
  { id: 7, image: dorm3, name: "Baan Sabai", location: "ลาดพร้าว", distance: "1.2 กม.", rating: 4.0, reviews: 42, price: 2500, originalPrice: 3000, badge: "ลดราคา", badgeType: "promo" as const, roomType: "shared", amenities: ["fan"], pets: true, nearBTS: true, lat: 13.8160, lng: 100.5620 },
  { id: 8, image: dorm4, name: "Loft Studio 88", location: "ศรีราชา", distance: "700 ม.", rating: 4.9, reviews: 310, price: 6500, badge: "ยอดนิยม", badgeType: "hot" as const, roomType: "single", amenities: ["air", "wifi", "parking", "furniture", "fitness"], pets: false, nearBTS: false, lat: 13.1674, lng: 100.9265 },
  { id: 9, image: dorm1, name: "PJ Mansion", location: "ใกล้ ม.ศิลปากร", distance: "350 ม.", rating: 3.9, reviews: 30, price: 2200, roomType: "shared", amenities: ["fan", "wifi"], pets: false, nearBTS: false, lat: 13.8205, lng: 100.0425 },
  { id: 10, image: dorm2, name: "City Dorm Plus", location: "เชียงใหม่", distance: "900 ม.", rating: 4.4, reviews: 88, price: 3500, badge: "ใหม่", badgeType: "new" as const, roomType: "single", amenities: ["air", "wifi", "furniture"], pets: true, nearBTS: false, lat: 18.7953, lng: 98.9523 },
  { id: 11, image: dorm3, name: "River Side Room", location: "ใกล้ ม.ธรรมศาสตร์", distance: "1 กม.", rating: 4.1, reviews: 55, price: 2900, roomType: "single", amenities: ["air", "wifi", "parking"], pets: false, nearBTS: true, lat: 14.0723, lng: 100.6015 },
  { id: 12, image: dorm4, name: "Premium Suite", location: "สยาม", distance: "400 ม.", rating: 4.6, reviews: 175, price: 7500, badge: "ยอดนิยม", badgeType: "hot" as const, roomType: "single", amenities: ["air", "wifi", "parking", "furniture", "fitness"], pets: true, nearBTS: true, lat: 13.7460, lng: 100.5347 },
];

const ITEMS_PER_PAGE = 6;
type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "nearest";

const DEFAULT_PRICE = [1000, 10000];

const amenityLabels: Record<string, string> = {
  air: "แอร์", wifi: "Wi-Fi", parking: "ที่จอดรถ", furniture: "เฟอร์นิเจอร์", fitness: "ฟิตเนส",
};

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: "popular", label: "ยอดนิยม", icon: "🔥" },
  { value: "price-asc", label: "ราคาต่ำ → สูง", icon: "💸" },
  { value: "price-desc", label: "ราคาสูง → ต่ำ", icon: "💸" },
  { value: "rating", label: "รีวิวดีที่สุด", icon: "⭐" },
  { value: "nearest", label: "ใกล้ที่สุด", icon: "📍" },
];

const DEFAULT_SORT: SortOption = "popular";

/** Parse distance string to meters for sorting */
function parseDistance(d: string): number {
  const num = parseFloat(d);
  if (isNaN(num)) return Infinity;
  if (d.includes("กม")) return num * 1000;
  return num;
}

// ─── Parse URL → State ───
function parseParams(sp: URLSearchParams) {
  const priceMin = Number(sp.get("price_min")) || DEFAULT_PRICE[0];
  const priceMax = Number(sp.get("price_max")) || DEFAULT_PRICE[1];
  return {
    q: sp.get("q") || "",
    priceRange: [Math.max(priceMin, DEFAULT_PRICE[0]), Math.min(priceMax, DEFAULT_PRICE[1])] as [number, number],
    roomTypes: sp.getAll("type"),
    amenities: sp.getAll("amenity"),
    petFriendly: sp.get("pets") === "true",
    nearBTS: sp.get("bts") === "true",
    minRating: sp.get("rating4") === "true",
    sort: (sp.get("sort") as SortOption) || "popular",
    page: Number(sp.get("page")) || 1,
  };
}

const Listing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = parseParams(searchParams);

  // Local state for instant UI (debounced before URL sync)
  const [query, setQuery] = useState(params.q);
  const [priceRange, setPriceRange] = useState(params.priceRange);
  const [roomTypes, setRoomTypes] = useState<string[]>(params.roomTypes);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(params.amenities);
  const [petFriendly, setPetFriendly] = useState(params.petFriendly);
  const [nearBTS, setNearBTS] = useState(params.nearBTS);
  const [minRating, setMinRating] = useState(params.minRating);
  const [sort, setSort] = useState<SortOption>(params.sort);
  const [page, setPage] = useState(params.page);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search & price
  const debouncedQuery = useDebounce(query, 400);
  const debouncedPrice = useDebounce(priceRange, 350);

  // Save recent search when debounced query changes
  useEffect(() => { if (debouncedQuery) saveRecent(debouncedQuery); }, [debouncedQuery]);

  // Close suggest dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-suggest: filter suggestions by current query
  const suggestions = useMemo(() => {
    if (!query || query.length < 1) return [];
    return suggestionData.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  }, [query]);

  const recentSearches = useMemo(() => getRecent(), [searchFocused]); // refresh when focused

  // ─── URL Sync ───
  const syncURL = useCallback(() => {
    const p = new URLSearchParams();
    if (debouncedQuery) p.set("q", debouncedQuery);
    if (debouncedPrice[0] !== DEFAULT_PRICE[0]) p.set("price_min", String(debouncedPrice[0]));
    if (debouncedPrice[1] !== DEFAULT_PRICE[1]) p.set("price_max", String(debouncedPrice[1]));
    roomTypes.forEach((t) => p.append("type", t));
    selectedAmenities.forEach((a) => p.append("amenity", a));
    if (petFriendly) p.set("pets", "true");
    if (nearBTS) p.set("bts", "true");
    if (minRating) p.set("rating4", "true");
    if (sort !== "popular") p.set("sort", sort);
    if (page > 1) p.set("page", String(page));
    setSearchParams(p, { replace: true });
  }, [debouncedQuery, debouncedPrice, roomTypes, selectedAmenities, petFriendly, nearBTS, minRating, sort, page, setSearchParams]);

  useEffect(() => { syncURL(); }, [syncURL]);

  // Simulate loading on filter change
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [debouncedQuery, debouncedPrice, roomTypes, selectedAmenities, petFriendly, nearBTS, minRating, sort]);

  // ─── Filter + Sort ───
  const filtered = useMemo(() => {
    let result = allDorms.filter((d) => {
      if (debouncedQuery && !d.name.toLowerCase().includes(debouncedQuery.toLowerCase()) && !d.location.toLowerCase().includes(debouncedQuery.toLowerCase())) return false;
      if (d.price < debouncedPrice[0] || d.price > debouncedPrice[1]) return false;
      if (roomTypes.length > 0 && !roomTypes.includes(d.roomType)) return false;
      if (selectedAmenities.length > 0 && !selectedAmenities.every((a) => d.amenities.includes(a))) return false;
      if (petFriendly && !d.pets) return false;
      if (nearBTS && !d.nearBTS) return false;
      if (minRating && d.rating < 4) return false;
      return true;
    });
    // Primary + secondary sort with edge case handling
    result.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case "price-asc": cmp = a.price - b.price; break;
        case "price-desc": cmp = b.price - a.price; break;
        case "rating": cmp = (b.rating ?? 0) - (a.rating ?? 0); break;
        case "nearest": cmp = parseDistance(a.distance) - parseDistance(b.distance); break;
        default: cmp = b.reviews - a.reviews; break;
      }
      // Secondary sort: if equal, sort by rating desc then price asc
      if (cmp === 0) cmp = (b.rating ?? 0) - (a.rating ?? 0);
      if (cmp === 0) cmp = a.price - b.price;
      return cmp;
    });
    return result;
  }, [debouncedQuery, debouncedPrice, roomTypes, selectedAmenities, petFriendly, nearBTS, minRating, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // ─── Active filter tags ───
  const activeTags: { label: string; onRemove: () => void }[] = [];
  if (debouncedPrice[0] !== DEFAULT_PRICE[0] || debouncedPrice[1] !== DEFAULT_PRICE[1]) {
    activeTags.push({ label: `฿${debouncedPrice[0].toLocaleString()} – ${debouncedPrice[1].toLocaleString()}`, onRemove: () => setPriceRange(DEFAULT_PRICE as [number, number]) });
  }
  roomTypes.forEach((t) => activeTags.push({ label: t === "single" ? "ห้องเดี่ยว" : "ห้องรวม", onRemove: () => setRoomTypes((p) => p.filter((v) => v !== t)) }));
  selectedAmenities.forEach((a) => activeTags.push({ label: amenityLabels[a] || a, onRemove: () => setSelectedAmenities((p) => p.filter((v) => v !== a)) }));
  if (petFriendly) activeTags.push({ label: "เลี้ยงสัตว์ได้", onRemove: () => setPetFriendly(false) });
  if (nearBTS) activeTags.push({ label: "ใกล้ BTS / มหาลัย", onRemove: () => setNearBTS(false) });
  if (minRating) activeTags.push({ label: "4 ดาวขึ้นไป", onRemove: () => setMinRating(false) });
  if (sort !== DEFAULT_SORT) {
    const sortLabel = sortOptions.find((o) => o.value === sort)?.label || sort;
    activeTags.push({ label: `เรียง: ${sortLabel}`, onRemove: () => setSort(DEFAULT_SORT) });
  }

  const hasFilters = activeTags.length > 0;

  const resetFilters = () => {
    setQuery("");
    setPriceRange(DEFAULT_PRICE as [number, number]);
    setRoomTypes([]);
    setSelectedAmenities([]);
    setPetFriendly(false);
    setNearBTS(false);
    setMinRating(false);
    setSort(DEFAULT_SORT);
    setPage(1);
  };

  const toggleArray = (arr: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
    setPage(1);
  };

  // ─── Filter Sidebar (shared desktop/mobile) ───
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">ช่วงราคา</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {priceRange[0].toLocaleString()} – {priceRange[1].toLocaleString()} บาท
        </p>
        <Slider min={1000} max={10000} step={500} value={priceRange} onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1); }} className="mt-2" />
      </div>

      {/* Room type */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">ประเภทห้อง</h3>
        {[{ key: "single", label: "ห้องเดี่ยว" }, { key: "shared", label: "ห้องรวม" }].map((item) => (
          <label key={item.key} className="flex items-center gap-2 mb-2 cursor-pointer">
            <Checkbox checked={roomTypes.includes(item.key)} onCheckedChange={() => toggleArray(roomTypes, item.key, setRoomTypes)} />
            <span className="text-sm text-foreground">{item.label}</span>
          </label>
        ))}
      </div>

      {/* Amenities */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">สิ่งอำนวยความสะดวก</h3>
        {Object.entries(amenityLabels).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 mb-2 cursor-pointer">
            <Checkbox checked={selectedAmenities.includes(key)} onCheckedChange={() => toggleArray(selectedAmenities, key, setSelectedAmenities)} />
            <span className="text-sm text-foreground">{label}</span>
          </label>
        ))}
      </div>

      {/* Conditions */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">เงื่อนไขพิเศษ</h3>
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <Checkbox checked={petFriendly} onCheckedChange={(v) => { setPetFriendly(!!v); setPage(1); }} />
          <span className="text-sm text-foreground">เลี้ยงสัตว์ได้</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={nearBTS} onCheckedChange={(v) => { setNearBTS(!!v); setPage(1); }} />
          <span className="text-sm text-foreground">ใกล้ BTS / มหาลัย</span>
        </label>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Rating</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={minRating} onCheckedChange={(v) => { setMinRating(!!v); setPage(1); }} />
          <span className="text-sm text-foreground flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[hsl(var(--star))] text-[hsl(var(--star))]" /> 4 ดาวขึ้นไป
          </span>
        </label>
      </div>

      {/* Reset + Count */}
      <div className="pt-3 border-t border-border space-y-2">
        <p className="text-sm text-primary font-semibold">พบ {filtered.length} ห้อง</p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-muted-foreground w-full justify-start">
            <RotateCcw className="h-3.5 w-3.5" /> ล้างตัวกรองทั้งหมด
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb — dynamic based on URL context */}
        {(() => {
          // Build breadcrumb segments from current filters/search
          const crumbs: { label: string; href?: string; icon?: React.ReactNode }[] = [
            { label: "Home", href: "/", icon: <Home className="h-4 w-4" /> },
            { label: "หอพัก", href: "/listing" },
          ];

          // Add context crumbs from active filters
          if (debouncedQuery) {
            crumbs.push({ label: `ค้นหา "${debouncedQuery}"` });
          } else {
            // Show primary filter context
            const contextParts: string[] = [];
            if (roomTypes.length > 0) contextParts.push(roomTypes.map(t => t === "single" ? "ห้องเดี่ยว" : "ห้องรวม").join(", "));
            if (selectedAmenities.includes("air")) contextParts.push("ห้องแอร์");
            if (debouncedPrice[0] !== DEFAULT_PRICE[0] || debouncedPrice[1] !== DEFAULT_PRICE[1]) {
              contextParts.push(`฿${debouncedPrice[0].toLocaleString()}–${debouncedPrice[1].toLocaleString()}`);
            }
            if (nearBTS) contextParts.push("ใกล้ BTS / มหาลัย");
            if (contextParts.length > 0) {
              crumbs.push({ label: contextParts.slice(0, 2).join(" · ") });
            }
          }

          // JSON-LD structured data for SEO
          const jsonLd = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.label,
              ...(c.href ? { item: `${window.location.origin}${c.href}` } : {}),
            })),
          };

          const lastIdx = crumbs.length - 1;

          return (
            <>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
              <Breadcrumb className="mb-4">
                <BreadcrumbList className="flex-nowrap overflow-x-auto scrollbar-hide">
                  {crumbs.map((crumb, i) => (
                    <span key={i} className="contents">
                      {i > 0 && <BreadcrumbSeparator className="hidden sm:flex" />}
                      {/* Mobile: show only first + last, ellipsis in between */}
                      {i > 0 && i < lastIdx && crumbs.length > 2 && (
                        <BreadcrumbSeparator className="flex sm:hidden" />
                      )}
                      {i > 0 && i < lastIdx && crumbs.length > 3 ? (
                        <BreadcrumbItem className="hidden sm:flex">
                          {crumb.href ? (
                            <BreadcrumbLink asChild>
                              <Link to={crumb.href} className="flex items-center gap-1 hover:text-primary transition-colors">
                                {crumb.icon} {crumb.label}
                              </Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="font-semibold text-foreground">{crumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      ) : (
                        <BreadcrumbItem>
                          {i === lastIdx && !crumb.href ? (
                            <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
                              {crumb.label}
                            </BreadcrumbPage>
                          ) : crumb.href ? (
                            <BreadcrumbLink asChild>
                              <Link
                                to={crumb.href}
                                onClick={crumb.href === "/listing" ? resetFilters : undefined}
                                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                              >
                                {crumb.icon} {crumb.label}
                              </Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
                              {crumb.label}
                            </BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      )}
                    </span>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </>
          );
        })()}

        {/* Search + Sort bar */}
        <div className="sticky top-0 z-30 bg-muted/30 backdrop-blur-sm pb-3 -mx-4 px-4 sm:static sm:z-auto sm:bg-transparent sm:backdrop-blur-none sm:pb-0 sm:mx-0 sm:px-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Enhanced Search Bar */}
            <div ref={searchRef} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              {loading && query && (
                <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin z-10" />
              )}
              {query && (
                <button
                  onClick={() => { setQuery(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition z-10"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
              <input
                type="text"
                placeholder="ค้นหาหอพัก, มหาวิทยาลัย, พื้นที่..."
                className="w-full h-12 pl-10 pr-10 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => { if (e.key === "Enter") setSearchFocused(false); }}
              />

              {/* Auto-suggest dropdown */}
              {searchFocused && (suggestions.length > 0 || (query.length === 0 && recentSearches.length > 0)) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                  {/* Recent searches */}
                  {query.length === 0 && recentSearches.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground px-2 py-1 font-medium">ค้นหาล่าสุด</p>
                      {recentSearches.map((s, i) => (
                        <button
                          key={i}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition"
                          onMouseDown={(e) => { e.preventDefault(); setQuery(s); setPage(1); setSearchFocused(false); }}
                        >
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      {query.length === 0 || recentSearches.length === 0 ? null : <div className="border-t border-border my-1" />}
                      <p className="text-xs text-muted-foreground px-2 py-1 font-medium">แนะนำ</p>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition"
                          onMouseDown={(e) => { e.preventDefault(); setQuery(s); setPage(1); setSearchFocused(false); }}
                        >
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                          <HighlightText text={s} keyword={query} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Sort dropdown - desktop */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sort} onValueChange={(v) => { setSort(v as SortOption); setPage(1); }}>
              <SelectTrigger className="w-[200px] h-10 bg-card border-border">
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span>{opt.icon}</span> {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sort !== DEFAULT_SORT && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => { setSort(DEFAULT_SORT); setPage(1); }} title="รีเซ็ตการเรียง">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* View toggle */}
          <div className="hidden md:flex items-center border border-border rounded-lg overflow-hidden shrink-0">
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 flex items-center gap-1 text-xs font-medium transition ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-secondary"}`}>
              <LayoutGrid className="h-4 w-4" /> รายการ
            </button>
            <button onClick={() => setViewMode("map")} className={`px-3 py-2 flex items-center gap-1 text-xs font-medium transition ${viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-secondary"}`}>
              <Map className="h-4 w-4" /> แผนที่
            </button>
          </div>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden mb-4 flex gap-2">
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" /> ตัวกรอง
                {hasFilters && <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-[10px] flex items-center justify-center">{activeTags.length}</span>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>ตัวกรอง</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterContent />
              </div>
              <div className="mt-4 pb-4">
                <Button className="w-full" onClick={() => setMobileFilterOpen(false)}>
                  ดูผลลัพธ์ ({filtered.length} ห้อง)
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                {sortOptions.find((o) => o.value === sort)?.label || "เรียงตาม"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl pb-8">
              <SheetHeader>
                <SheetTitle>เรียงตาม</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setPage(1); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${sort === opt.value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}
                  >
                    <span className="text-lg">{opt.icon}</span>
                    {opt.label}
                    {sort === opt.value && <span className="ml-auto text-primary">✓</span>}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search highlight + result count */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {debouncedQuery && (
              <p className="text-lg font-semibold text-foreground">
                ผลลัพธ์สำหรับ "<span className="text-primary">{debouncedQuery}</span>"
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              พบ <span className="font-semibold text-primary">{filtered.length}</span> ห้อง
              {loading && <span className="ml-2 inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            </p>
          </div>
          {/* Current sort indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
            <ArrowUpDown className="h-3 w-3" />
            เรียงตาม: <span className="font-semibold text-foreground">{sortOptions.find((o) => o.value === sort)?.icon} {sortOptions.find((o) => o.value === sort)?.label}</span>
          </div>
        </div>

        {/* Active filter tags */}
        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {activeTags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {tag.label}
                <button onClick={tag.onRemove} className="hover:bg-primary/20 rounded-full p-0.5 transition"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> ล้างทั้งหมด
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="flex gap-6">
          {/* Sidebar - desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-card rounded-xl border border-border p-5 sticky top-20">
              <FilterContent />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {viewMode === "map" ? (
              <div className="bg-card border border-border rounded-xl h-[500px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Map className="h-16 w-16 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-semibold">Map View</p>
                  <p className="text-sm">แผนที่จะแสดงตำแหน่งหอพักทั้งหมด</p>
                  <p className="text-xs mt-1">(เชื่อมต่อ Google Maps API เร็ว ๆ นี้)</p>
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 bg-card rounded-xl border border-border p-4 animate-pulse">
                    <Skeleton className="w-48 h-36 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-32 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paged.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-12 text-center">
                <SearchX className="h-20 w-20 mx-auto text-muted-foreground/40 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">ไม่พบหอที่ตรงเงื่อนไข</h3>
                <p className="text-muted-foreground mb-4">ลองเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น</p>
                <Button onClick={resetFilters} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> รีเซ็ตตัวกรอง
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${debouncedQuery}-${sort}-${safePage}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {paged.map((dorm, idx) => (
                    <motion.div
                      key={dorm.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="relative flex flex-col sm:flex-row gap-0 sm:gap-4 bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                      {/* Image */}
                      <div className="relative w-full sm:w-56 h-48 sm:h-auto shrink-0 overflow-hidden">
                        <img src={dorm.image} alt={dorm.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        {dorm.badge && (
                          <span className={`absolute top-3 left-3 ${dorm.badgeType === "hot" ? "badge-hot" : dorm.badgeType === "new" ? "badge-new" : "badge-promo"}`}>
                            {dorm.badge}
                          </span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-foreground"><HighlightText text={dorm.name} keyword={debouncedQuery} /></h4>
                          <p className="text-primary font-bold text-lg mt-1">
                            ฿{dorm.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ เดือน</span>
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 fill-[hsl(var(--star))] text-[hsl(var(--star))]" />
                            <span className="text-sm font-medium text-foreground">{dorm.rating}</span>
                            <span className="text-sm text-muted-foreground">({dorm.reviews} รีวิว)</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {dorm.distance} จาก <HighlightText text={dorm.location} keyword={debouncedQuery} />
                          </p>
                          {/* Amenity chips */}
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {dorm.amenities.slice(0, 4).map((a) => (
                              <span key={a} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{amenityLabels[a] || a}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Button size="sm" className="gap-1">ดูรายละเอียด →</Button>
                        </div>
                      </div>
                      {/* Heart */}
                      <div className="absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto sm:pr-4 sm:pt-4">
                        <button className="bg-background/80 sm:bg-transparent rounded-full p-1.5 hover:bg-secondary transition">
                          <span className="text-destructive text-xl">♥</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Pagination */}
            {totalPages > 1 && paged.length > 0 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage(Math.max(1, safePage - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={safePage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === safePage}
                          onClick={(e) => { e.preventDefault(); setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {totalPages > 5 && (
                      <>
                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, safePage + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        className={safePage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Listing;
