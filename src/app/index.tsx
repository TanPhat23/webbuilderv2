import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/tanstack-react-start";
import Lenis from "lenis";

import {
  LandingPageHeader,
  LandingPageHero,
  BuildStage,
  Marquee,
  LiveEditorDemo,
  LandingPageFeature,
  LandingPageExport,
  LandingPagePricing,
  LandingPageFAQ,
  LandingPageCTA,
  LandingPageFooter,
  SelectionCursor,
} from "@/features/landing";

export const Route = createFileRoute("/")({
  component: WebBuilderLanding,
});

function WebBuilderLanding() {
  const { user, isLoaded } = useUser();
  const ctaTo = isLoaded && user ? "/dashboard" : "/sign-up";

  // Smooth scrolling for the scroll-driven sections. Skipped for reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ anchors: true, lerp: 0.1 });
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return (
    // The root layout is a flex row (sidebar provider), so the page must claim the full width.
    // overflow-x-clip (not hidden) so the pinned build stage can still use position: sticky.
    <div className="landing min-h-screen w-full min-w-0 flex-1 overflow-x-clip">
      <SelectionCursor />
      <LandingPageHeader />
      <main>
        <LandingPageHero ctaTo={ctaTo} />
        <BuildStage />
        <Marquee />
        <LiveEditorDemo />
        <LandingPageFeature />
        <LandingPageExport />
        <section id="pricing" className="scroll-mt-16">
          <LandingPagePricing />
          <LandingPageFAQ />
        </section>
        <LandingPageCTA ctaTo={ctaTo} />
      </main>
      <LandingPageFooter />
    </div>
  );
}
