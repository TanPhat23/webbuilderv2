"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useInView } from "@/hooks";

const footerSections = [
  {
    title: "Marketplace",
    links: ["Browse Templates", "Upload Template", "Categories", "Featured", "Popular"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact", "Press"],
  },
  {
    title: "Support",
    links: [
      "Help Center",
      "Community",
      "Privacy Policy",
      "Terms of Service",
      "Status",
    ],
  },
];

const socialLinks = ["Twitter", "LinkedIn", "GitHub", "Discord"];

export function MarketplaceFooter() {
  const [ref, inView] = useInView();

  return (
    <footer
      ref={ref}
      className="border-t border-border/50 py-16 bg-background/50 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div
          className={`grid md:grid-cols-4 gap-12 transition-all duration-1000 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">WebBuilder</span>
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Discover and share professional website templates with our community marketplace.
            </p>
          </div>

          {footerSections.map((section, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${(index + 1) * 150}ms`,
              }}
            >
              <h3 className="font-semibold text-lg mb-6">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className={`border-t border-border/50 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 transition-all duration-1000 delay-300 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} WebBuilder. All rights reserved.
          </p>
          <div className="flex space-x-8">
            {socialLinks.map((social, index) => (
              <Link
                key={social}
                href="#"
                className={`text-muted-foreground hover:text-foreground transition-all duration-500 hover:scale-110 ${
                  inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{
                  transitionDelay: `${600 + index * 100}ms`,
                }}
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}