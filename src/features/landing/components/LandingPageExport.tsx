const CODE = `/**
 * Generated component
 */
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <>
      <div className="flex flex-col items-start gap-4 p-8">
        <h1 className="text-5xl font-semibold">Spring menu is live</h1>
        <Button className="bg-black text-white">Book a table</Button>
      </div>
    </>
  );
};

export default Hero;`;

const POINTS = [
  {
    title: "A component per page",
    body: "Each page exports as one React component.",
  },
  {
    title: "Tailwind classes",
    body: "Styling is plain className strings.",
  },
  {
    title: "shadcn/ui parts",
    body: "Buttons and cards import from @/components/ui.",
  },
];

export default function LandingPageExport() {
  return (
    <section id="export" className="scroll-mt-16 border-t border-border bg-neutral-950 text-white dark:bg-card">
      <div className="container mx-auto px-4 py-20 lg:px-6 lg:py-28">
        <h2 className="font-display max-w-3xl text-4xl leading-[1.02] lg:text-6xl">
          Not a screenshot. Not a black box.{" "}
          <em className="text-[var(--landing-signal)]">Code.</em>
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <ul className="divide-y divide-white/20 border-y border-white/20 self-start">
            {POINTS.map((point) => (
              <li key={point.title} className="py-5">
                <h3 className="font-display text-2xl leading-none">{point.title}</h3>
                <p className="mt-2 text-base leading-relaxed opacity-75">{point.body}</p>
              </li>
            ))}
          </ul>

          <div className="min-w-0 border border-white/25">
            <div className="font-label flex items-center justify-between border-b border-white/25 px-4 py-3 opacity-80">
              <span>Hero.tsx</span>
              <span>Exported</span>
            </div>
            <pre
              aria-label="Example of an exported React component"
              className="overflow-x-auto px-4 py-4 text-[0.8rem] leading-6"
              style={{ fontFamily: '"Geist Mono Variable", ui-monospace, monospace' }}
            >
              {CODE}
            </pre>
          </div>
        </div>

        <p className="font-label mt-4 opacity-60">
          Example output, trimmed.
        </p>
      </div>
    </section>
  );
}
