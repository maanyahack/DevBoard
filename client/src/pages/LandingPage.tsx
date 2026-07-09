import { LandingNav } from '@/features/landing/components/LandingNav';
import { Hero } from '@/features/landing/components/Hero';
import { FeatureSection } from '@/features/landing/components/FeatureSection';
import { CTASection } from '@/features/landing/components/CTASection';
import { Footer } from '@/features/landing/components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <Hero />
      <FeatureSection />
      <CTASection />
      <Footer />
    </div>
  );
}
