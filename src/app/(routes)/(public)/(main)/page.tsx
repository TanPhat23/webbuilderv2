"use client";

import { Sparkles, Menu, X, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import LandingPageHero from "@/components/landingpage/LandingPageHero";
import LandingPageStats from "@/components/landingpage/LandingPageStats";
import LandingPageFeature from "@/components/landingpage/LandingPageFeature";
import LandingPageTestimonials from "@/components/landingpage/LandingPageTestimonials";
import LandingPagePricing from "@/components/landingpage/LandingPagePricing";
import LandingPageFAQ from "@/components/landingpage/LandingPageFAQ";
import LandingPageCTA from "@/components/landingpage/LandingPageCTA";
import LandingPageFooter from "@/components/landingpage/LandingPageFooter";


export default function WebBuilderLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen min-w-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header
        className={`border-b border-border/50 backdrop-blur-md sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/95 shadow-lg shadow-primary/5"
            : "bg-background/80"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-linear-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
              WebBuilder
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Features", "Pricing", "Testimonials"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground transition-all duration-300 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeSwitcher />
            {isLoaded && user ? (
              // Authenticated user - show Dashboard and Profile
              <>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                  asChild
                >
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
                <Button 
                  className="bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              // Not authenticated - show Sign In and Start Free Trial
              <>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                  asChild
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button 
                  className="bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/sign-up">Start Free Trial</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-all duration-300 hover:bg-accent/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="relative w-5 h-5">
              <Menu
                className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`}
              />
              <X
                className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
              />
            </div>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md transition-all duration-500 ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            {["Features", "Pricing", "Testimonials"].map((item, index) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`block text-muted-foreground hover:text-foreground transition-all duration-300 transform ${
                  mobileMenuOpen
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-4 opacity-0"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
              {isLoaded && user ? (
                // Authenticated user - show Dashboard and Profile
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                  <Button className="bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                </>
              ) : (
                // Not authenticated - show Sign In and Start Free Trial
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button className="bg-linear-to-r from-primary to-accent text-primary-foreground font-semibold" asChild>
                    <Link href="/sign-up">Start Free Trial</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <LandingPageHero />


      <LandingPageStats />

      <LandingPageFeature />

      <LandingPageTestimonials />

      <section id="pricing">
        <LandingPagePricing />
        <LandingPageFAQ />
      </section>

      <LandingPageCTA />

      <LandingPageFooter />
    </div>
  );
}