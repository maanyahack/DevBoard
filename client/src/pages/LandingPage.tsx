// Import the landing page section components — each renders a different
// part of the marketing/landing page.
import { LandingNav } from '@/features/landing/components/LandingNav';    // Top navigation bar
import { Hero } from '@/features/landing/components/Hero';                // Main hero section
import { FeatureSection } from '@/features/landing/components/FeatureSection';  // Features grid
import { CTASection } from '@/features/landing/components/CTASection';    // Call-to-action section
import { Footer } from '@/features/landing/components/Footer';            // Page footer

/**
 * LandingPage — the public marketing/home page.
 *
 * This is the page shown to unauthenticated visitors (at the "/" URL).
 * It presents the product's features and encourages signups.
 * The page is composed of modular section components for easy maintenance.
 *
 * Structure:
 * ┌──────────────────┐
 * │   LandingNav     │ ← Logo + Login/Signup buttons
 * ├──────────────────┤
 * │      Hero        │ ← Headline + CTA
 * ├──────────────────┤
 * │  FeatureSection  │ ← Feature cards grid
 * ├──────────────────┤
 * │    CTASection    │ ← "Get started" section
 * ├──────────────────┤
 * │     Footer       │ ← Links + copyright
 * └──────────────────┘
 */
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
