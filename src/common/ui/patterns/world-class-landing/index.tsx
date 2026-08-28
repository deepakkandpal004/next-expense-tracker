"use client";
import { RainbowStyles } from "../rainbow-animation";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { FeaturesSection } from "./features-section";
import { AISection } from "./ai-section";
import { FAQSection } from "./faq-section";
import { CTASection } from "./cta-section";

export function WorldClassLandingPage() {
  return (
    <main id="home" className="landing-page">
      <RainbowStyles />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <AISection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
