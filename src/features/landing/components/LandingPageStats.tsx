"use client";

import { useInView } from "@/hooks";

const stats = [
  { value: "50K+", label: "Websites Created" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s", label: "Load Time" },
  { value: "4.9★", label: "User Rating" },
];

export default function LandingPageStats() {
  const [ref, inView] = useInView();

  return (
    <section
      ref={ref}
      className="py-16 bg-gradient-to-r from-accent/5 via-background to-primary/5"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`space-y-2 group transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
