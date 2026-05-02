import ParticleField from "@/components/ui/ParticleField";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TemplatesSection from "@/components/landing/TemplatesSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0f]">
      <ParticleField />
      <Navbar />
      <HeroSection />
      <TemplatesSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
