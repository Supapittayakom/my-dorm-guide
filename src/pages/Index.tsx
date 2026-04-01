import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import QuickFilters from "@/components/QuickFilters";
import RecommendedDorms from "@/components/RecommendedDorms";
import NearUniversity from "@/components/NearUniversity";
import TrendingSection from "@/components/TrendingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <HeroSection />
      <SearchBar />
      <QuickFilters />
      
      {/* Recommended + Near University side by side on large screens */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecommendedDorms />
          </div>
          <div className="lg:col-span-1">
            <NearUniversity />
          </div>
        </div>
      </div>

      <TrendingSection />
      <Footer />
    </div>
  );
};

export default Index;
