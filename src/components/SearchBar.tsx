import { useState } from "react";
import { Search, MapPin, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const suggestions = [
  "ม.เชียงใหม่",
  "ม.เกษตรศาสตร์ บางเขน",
  "หอในเมือง เชียงใหม่",
  "ลาดพร้าว กรุงเทพฯ",
  "ศรีราชา ชลบุรี",
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(["ม.เชียงใหม่", "หอในเมือง", "ม.เกษตร บางเขน"]);

  const filtered = query
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSearch = () => {
    if (query && !recentSearches.includes(query)) {
      setRecentSearches((prev) => [query, ...prev.slice(0, 4)]);
    }
    setFocused(false);
  };

  const removeRecent = (item: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== item));
  };

  return (
    <div className="relative -mt-8 z-20 container mx-auto px-4">
      <div className="bg-background rounded-2xl shadow-lg border border-border p-4 md:p-5">
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Input */}
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาหอพัก, มหาวิทยาลัย, พื้นที่..."
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Near me button */}
          <Button variant="outline" className="gap-2 h-12 shrink-0">
            <MapPin className="h-4 w-4" /> ใกล้ฉัน
          </Button>

          {/* Search button */}
          <Button className="gap-2 h-12 px-8 shrink-0" onClick={handleSearch}>
            <Search className="h-4 w-4" /> ค้นหา
          </Button>
        </div>

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">การค้นหาล่าสุด:</span>
            {recentSearches.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs cursor-pointer hover:bg-secondary/70 transition"
              >
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecent(item);
                  }}
                />
              </span>
            ))}
          </div>
        )}

        {/* Suggestions dropdown */}
        {focused && (query ? filtered.length > 0 : true) && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-background border border-border rounded-xl shadow-lg py-2 z-30">
            {query ? (
              filtered.map((s) => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-2.5 hover:bg-secondary text-sm flex items-center gap-2 text-foreground"
                  onMouseDown={() => {
                    setQuery(s);
                    handleSearch();
                  }}
                >
                  <Search className="h-4 w-4 text-muted-foreground" /> {s}
                </button>
              ))
            ) : (
              <>
                <p className="px-4 py-1 text-xs text-muted-foreground font-medium">คำแนะนำ</p>
                {suggestions.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    className="w-full text-left px-4 py-2.5 hover:bg-secondary text-sm flex items-center gap-2 text-foreground"
                    onMouseDown={() => {
                      setQuery(s);
                      handleSearch();
                    }}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" /> {s}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
