import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useUser } from "@clerk/tanstack-react-start";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#build", label: "How it works" },
  { href: "#export", label: "Export" },
  { href: "#pricing", label: "Pricing" },
];

function Wordmark() {
  return (
    <Link to="/" className="flex items-baseline gap-1.5" aria-label="WebBuilder home">
      <span aria-hidden className="size-2.5 translate-y-[1px] bg-[var(--landing-signal)]" />
      <span className="font-display text-2xl leading-none">webbuilder</span>
    </Link>
  );
}

export default function LandingPageHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoaded } = useUser();
  const signedIn = Boolean(isLoaded && user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const actions = signedIn ? (
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-2 bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-85"
    >
      <LayoutDashboard className="size-4" />
      Dashboard
    </Link>
  ) : (
    <>
      <Link to="/sign-in" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        Sign in
      </Link>
      <Link
        to="/sign-up"
        className="bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-85"
      >
        Start free
      </Link>
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/90 backdrop-blur transition-colors",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <Wordmark />
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <ThemeSwitcher />
          {actions}
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center md:hidden"
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div id="landing-mobile-menu" className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-base font-medium"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 flex items-center gap-5 border-t border-border pt-4">
              <ThemeSwitcher />
              {actions}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
