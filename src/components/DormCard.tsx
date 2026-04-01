import { Star, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DormCardProps {
  image: string;
  name: string;
  location: string;
  distance?: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  badgeType?: "hot" | "new" | "promo";
}

const DormCard = ({
  image,
  name,
  location,
  distance,
  rating,
  reviews,
  price,
  originalPrice,
  badge,
  badgeType = "hot",
}: DormCardProps) => {
  const [liked, setLiked] = useState(false);

  const badgeClass =
    badgeType === "hot" ? "badge-hot" : badgeType === "new" ? "badge-new" : "badge-promo";

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && (
          <span className={`absolute top-3 left-3 ${badgeClass}`}>{badge}</span>
        )}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 bg-background/80 rounded-full p-1.5 hover:bg-background transition"
        >
          <Heart
            className={`h-5 w-5 transition ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
          />
        </button>
        <div className="absolute bottom-3 left-3 bg-background/90 rounded-lg px-2 py-1 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-star text-star" />
          <span className="text-xs font-semibold text-foreground">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-foreground truncate">{name}</h4>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {location}
          {distance && <span>· {distance}</span>}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <Star className="h-3.5 w-3.5 fill-star text-star" />
          <span className="text-sm font-medium text-foreground">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviews} รีวิว)</span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {originalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-lg font-bold text-primary">
            {price.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">บาท/เดือน</span>
        </div>

        <Button className="w-full mt-3" size="sm">
          ดูรายละเอียด
        </Button>
      </div>
    </div>
  );
};

export default DormCard;
