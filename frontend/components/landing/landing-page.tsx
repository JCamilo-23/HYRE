import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustStrip } from "@/components/landing/trust-strip"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { ProductPreviewSection } from "@/components/landing/product-preview-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { CtaSection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { GradientMesh } from "@/components/landing/gradient-mesh"

export function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-hidden bg-[#0a0614] text-foreground">
            <div className="hyre-grain" aria-hidden />
      <GradientMesh />
      <Navbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <FeaturesSection />
        <HowItWorksSection />
        <ProductPreviewSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
