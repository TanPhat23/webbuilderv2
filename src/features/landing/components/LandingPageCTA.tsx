"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks";

export default function LandingPageCTA() {
  const [ref, inView] = useInView();

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-r from-primary/10 via-background to-accent/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
      <div className="container mx-auto px-4 lg:px-6 text-center relative">
        <div
          className={`max-w-4xl mx-auto space-y-8 transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <h2 className="text-3xl lg:text-6xl font-bold leading-tight">
            Ready to build your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              dream website?
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of creators who trust WebBuilder to bring their
            vision to life. No code required, just drag, drop, and publish—the
            way it should be.
          </p>
          <div
            className={`flex flex-col sm:flex-row gap-6 justify-center pt-8 transition-all duration-1000 delay-300 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold text-xl px-12 py-6 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 group"
              asChild
            >
              <Link href="/sign-up">
                Start Your Free Trial
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent/10 hover:text-foreground hover:border-accent/50 transition-all duration-300 hover:scale-105 bg-transparent backdrop-blur-sm text-xl px-12 py-6"
            >
              Schedule a Demo
            </Button>
          </div>
          <p
            className={`text-sm text-muted-foreground pt-4 transition-all duration-1000 delay-500 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
