import { Link } from "@tanstack/react-router";
import KineticText from "./KineticText";

export default function LandingPageFooter() {
  return (
    <footer className="overflow-hidden border-t border-border">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between lg:px-6">
        <p className="max-w-xs text-sm text-muted-foreground">A visual editor for teams who ship React.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <a href="#build" className="text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
          <Link to="/helppage" className="text-muted-foreground transition-colors hover:text-foreground">
            Help
          </Link>
          <Link to="/sign-in" className="text-muted-foreground transition-colors hover:text-foreground">
            Sign in
          </Link>
        </nav>
      </div>
      <div className="container mx-auto px-4 lg:px-6">
        <KineticText
          lines={[[{ text: "webbuilder", accent: false }]]}
          className="font-display -mb-[0.06em] text-[clamp(3.5rem,19vw,19rem)] leading-[0.85]"
        />
      </div>
      <div className="border-t border-border">
        <p className="font-label container mx-auto px-4 py-4 text-muted-foreground lg:px-6">
          © {new Date().getFullYear()} WebBuilder
        </p>
      </div>
    </footer>
  );
}
