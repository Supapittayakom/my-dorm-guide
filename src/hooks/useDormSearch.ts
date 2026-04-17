import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SortOption = "popular" | "price-asc" | "price-desc" | "rating" | "nearest";

export interface DormQuery {
  q: string;
  priceMin: number;
  priceMax: number;
  roomTypes: string[]; // 'single' | 'shared'
  amenities: string[]; // air, wifi, parking, furniture, fitness
  petFriendly: boolean;
  nearBTS: boolean; // mapped to has_security as a stand-in flag (not in schema). We'll skip if not present.
  minRating: boolean;
  sort: SortOption;
  page: number;
  pageSize: number;
}

export interface DormRow {
  id: string;
  name: string;
  description: string | null;
  price_min: number;
  price_max: number;
  room_type: string;
  rating: number | null;
  review_count: number | null;
  view_count: number | null;
  thumbnail_url: string | null;
  near_university: string | null;
  district: string | null;
  province: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  has_air_conditioning: boolean;
  has_wifi: boolean;
  has_parking: boolean;
  has_furniture: boolean;
  has_pet_allowed: boolean;
  has_security: boolean;
  has_cctv: boolean;
  has_elevator: boolean;
  has_laundry: boolean;
  has_kitchen: boolean;
}

const amenityColumnMap: Record<string, keyof DormRow> = {
  air: "has_air_conditioning",
  wifi: "has_wifi",
  parking: "has_parking",
  furniture: "has_furniture",
  fitness: "has_elevator", // closest stand-in; remove if not desired
};

export function useDormSearch(query: DormQuery) {
  const [data, setData] = useState<DormRow[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);

      let q = supabase
        .from("dorms")
        .select("*", { count: "exact" })
        .eq("status", "published");

      // Search across name, near_university, district, province, address
      if (query.q.trim()) {
        const term = `%${query.q.trim()}%`;
        q = q.or(
          [
            `name.ilike.${term}`,
            `near_university.ilike.${term}`,
            `district.ilike.${term}`,
            `province.ilike.${term}`,
            `address.ilike.${term}`,
          ].join(",")
        );
      }

      // Price overlap: dorm price range overlaps requested range
      q = q.gte("price_max", query.priceMin).lte("price_min", query.priceMax);

      if (query.roomTypes.length > 0) {
        q = q.in("room_type", query.roomTypes);
      }

      for (const a of query.amenities) {
        const col = amenityColumnMap[a];
        if (col) q = q.eq(col, true);
      }

      if (query.petFriendly) q = q.eq("has_pet_allowed", true);
      if (query.minRating) q = q.gte("rating", 4);

      // Sort
      switch (query.sort) {
        case "price-asc":
          q = q.order("price_min", { ascending: true });
          break;
        case "price-desc":
          q = q.order("price_max", { ascending: false });
          break;
        case "rating":
          q = q.order("rating", { ascending: false, nullsFirst: false });
          break;
        case "nearest":
          // No user location server-side; fall back to created_at desc
          q = q.order("created_at", { ascending: false });
          break;
        default:
          q = q.order("view_count", { ascending: false, nullsFirst: false });
          break;
      }

      // Pagination
      const from = (query.page - 1) * query.pageSize;
      const to = from + query.pageSize - 1;
      q = q.range(from, to);

      const { data: rows, error: err, count: total } = await q;
      if (cancelled) return;

      if (err) {
        setError(err.message);
        setData([]);
        setCount(0);
      } else {
        setData((rows as DormRow[]) || []);
        setCount(total || 0);
      }
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    query.q,
    query.priceMin,
    query.priceMax,
    query.roomTypes.join(","),
    query.amenities.join(","),
    query.petFriendly,
    query.nearBTS,
    query.minRating,
    query.sort,
    query.page,
    query.pageSize,
  ]);

  return { data, count, loading, error };
}

export async function fetchDormSuggestions(term: string, limit = 6): Promise<string[]> {
  if (!term.trim()) return [];
  const t = `%${term.trim()}%`;
  const { data } = await supabase
    .from("dorms")
    .select("name, near_university, district")
    .eq("status", "published")
    .or(`name.ilike.${t},near_university.ilike.${t},district.ilike.${t}`)
    .limit(limit);

  if (!data) return [];
  const set = new Set<string>();
  for (const r of data as { name: string; near_university: string | null; district: string | null }[]) {
    const lower = term.toLowerCase();
    if (r.name?.toLowerCase().includes(lower)) set.add(r.name);
    if (r.near_university?.toLowerCase().includes(lower)) set.add(r.near_university);
    if (r.district?.toLowerCase().includes(lower)) set.add(r.district);
  }
  return Array.from(set).slice(0, limit);
}
