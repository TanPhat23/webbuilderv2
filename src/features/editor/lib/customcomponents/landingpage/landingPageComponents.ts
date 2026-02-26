import { v4 as uuidv4 } from "uuid";
import { CustomComponent } from "../customComponents";

/**
 * Split landing page: each major section exported as its own CustomComponent.
 *
 * - Each exported component uses a `Section` as the root element (as requested).
 * - Helper factories (createFeature, createStat, etc.) are reused so the sections
 *   remain concise and consistent with the original template.
 *
 * NOTE: We cast to `CustomComponent` with `as unknown as CustomComponent` to keep
 * template authoring ergonomic (same pattern as the original file).
 */

/* -------------------------------------------------------------------------- */
/* --------------------------------- Helpers --------------------------------- */
/* -------------------------------------------------------------------------- */

function mkId(prefix: string) {
  return `${prefix}-${uuidv4().slice(0, 8)}`;
}

function createFeature(title: string, body: string) {
  return {
    type: "Frame",
    name: mkId(title),
    content: "",
    tailwindStyles: "p-6 rounded-lg bg-transparent",
    elements: [
      {
        type: "Text",
        content: title,
        tailwindStyles: "font-semibold text-foreground",
      },
      {
        type: "Text",
        content: body,
        tailwindStyles: "text-sm text-muted-foreground mt-2",
      },
    ],
    href: "",
    src: "",
  };
}

function createStat(value: string, label: string) {
  return {
    type: "Frame",
    name: mkId(label),
    content: "",
    tailwindStyles: "flex flex-col items-center",
    elements: [
      {
        type: "Text",
        content: value,
        tailwindStyles: "text-3xl font-extrabold text-foreground",
      },
      {
        type: "Text",
        content: label,
        tailwindStyles: "text-sm text-muted-foreground mt-1",
      },
    ],
    href: "",
    src: "",
  };
}

function createTestimonial(
  name: string,
  role: string,
  quote: string,
  avatar?: string,
) {
  return {
    type: "Frame",
    name: mkId(name),
    content: "",
    tailwindStyles: "p-6 rounded-lg bg-card border border-border",
    elements: [
      {
        type: "Frame",
        name: mkId("meta"),
        content: "",
        tailwindStyles: "flex items-center gap-3 mb-3",
        elements: [
          {
            type: "Image",
            content: avatar ? `${name} avatar` : "avatar-placeholder",
            src: avatar ?? "",
            alt: avatar ? `${name} avatar` : `${name} avatar`,
            loading: "lazy",
            width: 48,
            height: 48,
            objectFit: "cover",
            tailwindStyles: "w-12 h-12 rounded-full object-cover",
          },
          {
            type: "Frame",
            name: mkId("meta-text"),
            content: "",
            tailwindStyles: "flex flex-col",
            elements: [
              {
                type: "Text",
                content: name,
                tailwindStyles: "text-sm font-semibold text-foreground",
              },
              {
                type: "Text",
                content: role,
                tailwindStyles: "text-xs text-muted-foreground",
              },
            ],
          },
        ],
      },
      {
        type: "Text",
        content: `"${quote}"`,
        tailwindStyles: "text-sm text-muted-foreground",
      },
    ],
    href: "",
    src: "",
  };
}

function createPricingCard(
  title: string,
  price: string,
  bullets: string[],
  featured = false,
) {
  return {
    type: "Frame",
    name: mkId(title),
    content: "",
    tailwindStyles: `p-6 rounded-lg border ${featured ? "border-primary bg-card" : "border-border bg-background"}`,
    styles: featured
      ? { default: { borderColor: "var(--color-primary)" } }
      : {},
    elements: [
      {
        type: "Text",
        content: title,
        tailwindStyles: "text-lg font-semibold text-foreground",
      },
      {
        type: "Text",
        content: price,
        tailwindStyles: "text-2xl font-extrabold text-foreground mt-2",
      },
      {
        type: "Frame",
        name: mkId("bullets"),
        content: "",
        tailwindStyles: "mt-4 flex flex-col gap-2",
        elements: bullets.map((b) => ({
          type: "Text",
          content: b,
          tailwindStyles: "text-sm text-muted-foreground",
        })),
      },
      {
        type: "Button",
        content: featured ? "Get started" : "Choose",
        buttonType: "button",
        tailwindStyles: featured
          ? "mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground"
          : "mt-4 px-4 py-2 rounded-md border border-border text-foreground",
        styles: featured
          ? {
              default: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              },
            }
          : {},
        href: "/signup",
      },
    ],
    href: "",
    src: "",
  };
}

function createFAQ(question: string, answer: string) {
  return {
    type: "Frame",
    name: mkId(question),
    content: "",
    tailwindStyles: "p-4 rounded-lg bg-transparent border border-border",
    elements: [
      {
        type: "Text",
        content: question,
        tailwindStyles: "font-semibold text-foreground",
      },
      {
        type: "Text",
        content: answer,
        tailwindStyles: "text-sm text-muted-foreground mt-2",
      },
    ],
    href: "",
    src: "",
  };
}

/* -------------------------------------------------------------------------- */
/* --------------------------- Section Components --------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * Navbar section as its own CustomComponent (root: Section)
 */
export const NavbarSectionComponent = {
  component: {
    type: "Section",
    id: "navbar",
    name: "Navbar",
    role: "navigation",
    ariaLabel: "Main navigation",
    content: "",
    tailwindStyles:
      "w-full sticky top-0 z-50 bg-card py-3 px-4 md:px-8 flex items-center justify-between",
    elements: [
      {
        type: "Frame",
        name: "Brand",
        content: "",
        tailwindStyles: "flex items-center gap-3",
        elements: [
          {
            type: "Image",
            name: "Logo",
            content: "Brand logo",
            src: "",
            alt: "Brand logo",
            loading: "eager",
            width: 120,
            height: 36,
            objectFit: "contain",
            tailwindStyles: "h-9 w-auto object-contain",
          },
          {
            type: "Text",
            content: "WebBuilder",
            tailwindStyles: "text-lg font-semibold text-foreground",
          },
        ],
        href: "",
        src: "",
      },
      {
        type: "Frame",
        name: "NavLinks",
        content: "",
        tailwindStyles: "hidden md:flex items-center gap-6",
        elements: [
          {
            type: "Link",
            content: "Features",
            href: "#features",
            tailwindStyles: "text-foreground",
          },
          {
            type: "Link",
            content: "Pricing",
            href: "#pricing",
            tailwindStyles: "text-foreground",
          },
          {
            type: "Link",
            content: "Customers",
            href: "#testimonials",
            tailwindStyles: "text-foreground",
          },
          {
            type: "Link",
            content: "Docs",
            href: "/docs",
            tailwindStyles: "text-foreground",
          },
        ],
        href: "",
        src: "",
      },
      {
        type: "Frame",
        name: "NavCTAs",
        content: "",
        tailwindStyles: "flex items-center gap-3",
        elements: [
          {
            type: "Button",
            content: "Sign in",
            href: "/signin",
            buttonType: "button",
            tailwindStyles: "px-3 py-2 rounded-md text-foreground",
            styles: { default: { backgroundColor: "transparent" } },
          },
          {
            type: "Button",
            content: "Get started",
            href: "/signup",
            buttonType: "button",
            tailwindStyles:
              "px-4 py-2 rounded-md bg-primary text-primary-foreground",
            styles: {
              default: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              },
            },
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/**
 * Hero section as its own CustomComponent (root: Section)
 */
export const HeroSectionComponent = {
  component: {
    type: "Section",
    id: "hero",
    name: "Hero",
    role: "region",
    ariaLabel: "Hero section",
    content: "",
    tailwindStyles: "w-full py-16 px-4 md:px-8 bg-muted",
    styles: { default: { backgroundColor: "var(--color-muted)" } },
    elements: [
      {
        type: "Frame",
        name: "HeroInner",
        content: "",
        tailwindStyles:
          "w-full max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8",
        elements: [
          {
            type: "Frame",
            name: "HeroText",
            content: "",
            tailwindStyles: "flex-1",
            elements: [
              {
                type: "Text",
                content: "Design and ship beautiful websites — faster",
                tailwindStyles:
                  "text-3xl md:text-5xl font-extrabold text-foreground",
              },
              {
                type: "Text",
                content:
                  "A visual site builder with components, responsive controls, and painless publishing.",
                tailwindStyles:
                  "text-base text-muted-foreground mt-4 max-w-2xl",
              },
              {
                type: "Frame",
                name: "HeroActions",
                content: "",
                tailwindStyles: "flex gap-3 mt-6",
                elements: [
                  {
                    type: "Button",
                    content: "Start free",
                    href: "/signup",
                    buttonType: "button",
                    tailwindStyles:
                      "bg-primary text-primary-foreground px-5 py-3 rounded-md",
                    styles: {
                      default: {
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-primary-foreground)",
                      },
                    },
                  },
                  {
                    type: "Button",
                    content: "View demo",
                    href: "/demo",
                    buttonType: "button",
                    tailwindStyles:
                      "px-5 py-3 rounded-md bg-card text-foreground border border-border",
                  },
                ],
              },
              {
                type: "Frame",
                name: "HeroTrust",
                content: "",
                tailwindStyles: "flex items-center gap-4 mt-6",
                elements: [
                  {
                    type: "Text",
                    content: "Trusted by teams worldwide",
                    tailwindStyles: "text-sm text-muted-foreground",
                  },
                  {
                    type: "Image",
                    content: "logos",
                    src: "",
                    alt: "Partner logos",
                    loading: "lazy",
                    width: 240,
                    height: 32,
                    objectFit: "contain",
                    tailwindStyles: "h-8 opacity-80",
                  },
                ],
              },
            ],
          },
          {
            type: "Frame",
            name: "HeroVisual",
            content: "",
            tailwindStyles: "flex-1 flex items-center justify-center",
            elements: [
              {
                type: "Image",
                name: "HeroScreenshot",
                content: "Editor screenshot",
                src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1170&q=80",
                alt: "App screenshot showing editor",
                loading: "lazy",
                width: 520,
                height: 360,
                objectFit: "cover",
                tailwindStyles:
                  "w-full max-w-[520px] rounded-xl shadow-xl object-cover",
              },
            ],
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/**
 * Features section
 */
export const FeaturesSectionComponent = {
  component: {
    type: "Section",
    id: "features",
    name: "Features",
    role: "region",
    ariaLabel: "Key features",
    content: "",
    tailwindStyles: "w-full py-16 px-4 md:px-8",
    styles: { default: { backgroundColor: "var(--color-background)" } },
    elements: [
      {
        type: "Frame",
        name: "FeaturesInner",
        content: "",
        tailwindStyles:
          "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8",
        elements: [
          createFeature(
            "Visual Editor",
            "Drag, drop and style with real-time previews.",
          ),
          createFeature(
            "Responsive Controls",
            "Adjust layouts and breakpoints visually.",
          ),
          createFeature(
            "Templates & Blocks",
            "Start from pre-built sections and customize freely.",
          ),
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/**
 * Stats section
 */
export const StatsSectionComponent = {
  component: {
    type: "Section",
    id: "stats",
    name: "Stats",
    role: "region",
    ariaLabel: "Product statistics",
    content: "",
    tailwindStyles: "w-full py-12 px-4 md:px-8 bg-card",
    styles: { default: { backgroundColor: "var(--color-card)" } },
    elements: [
      {
        type: "Frame",
        name: "StatsInner",
        content: "",
        tailwindStyles:
          "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center",
        elements: [
          createStat("98%", "Customer satisfaction"),
          createStat("1.2M", "Sites published"),
          createStat("99.99%", "Uptime"),
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/**
 * Testimonials section
 */
export const TestimonialsSectionComponent = {
  component: {
    type: "Section",
    id: "testimonials",
    name: "Testimonials",
    role: "region",
    ariaLabel: "Customer testimonials",
    content: "",
    tailwindStyles: "w-full py-16 px-4 md:px-8",
    elements: [
      {
        type: "Frame",
        name: "TestimonialsInner",
        content: "",
        tailwindStyles: "max-w-6xl mx-auto",
        elements: [
          {
            type: "Text",
            content: "What customers say",
            tailwindStyles: "text-lg text-accent font-semibold",
          },
          {
            type: "Frame",
            name: "TestimonialGrid",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-6",
            elements: [
              createTestimonial(
                "Sofia Martin",
                "Lead Designer",
                "This tool saved us weeks of development.",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
              ),
              createTestimonial(
                "Liam Zhang",
                "CTO",
                "Great performance and an intuitive visual builder.",
                "https://images.unsplash.com/photo-1545996124-1b1b3f9a8b2f?auto=format&fit=crop&w=200&q=80",
              ),
              createTestimonial(
                "Aisha Khan",
                "Founder",
                "We launched faster than planned thanks to the templates.",
                "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80",
              ),
            ],
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/**
 * Pricing section
 */
export const PricingSectionComponent = {
  component: {
    type: "Section",
    id: "pricing",
    name: "Pricing",
    role: "region",
    ariaLabel: "Pricing plans",
    content: "",
    tailwindStyles: "w-full py-16 px-4 md:px-8 bg-muted",
    styles: { default: { backgroundColor: "var(--color-muted)" } },
    elements: [
      {
        type: "Frame",
        name: "PricingInner",
        content: "",
        tailwindStyles: "max-w-6xl mx-auto",
        elements: [
          {
            type: "Text",
            content: "Pricing that grows with you",
            tailwindStyles:
              "text-2xl md:text-4xl font-bold text-foreground text-center mb-6",
          },
          {
            type: "Frame",
            name: "PricingPlans",
            content: "",
            tailwindStyles:
              "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6",
            elements: [
              createPricingCard(
                "Starter",
                "$0",
                ["2 projects", "Community support"],
                false,
              ),
              createPricingCard(
                "Pro",
                "$29/mo",
                ["Unlimited projects", "Priority support", "Custom domains"],
                true,
              ),
              createPricingCard(
                "Enterprise",
                "Contact us",
                ["SAML SSO", "Dedicated support", "Custom SLAs"],
                false,
              ),
            ],
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/**
 * FAQ section
 */
export const FAQSectionComponent = {
  component: {
    type: "Section",
    id: "faq",
    name: "FAQ",
    role: "region",
    ariaLabel: "Frequently asked questions",
    content: "",
    tailwindStyles: "w-full py-14 px-4 md:px-8",
    elements: [
      {
        type: "Text",
        content: "Frequently asked questions",
        tailwindStyles:
          "text-2xl md:text-3xl font-bold text-foreground text-center mb-6",
      },
      {
        type: "Frame",
        name: "FAQList",
        content: "",
        tailwindStyles: "max-w-4xl mx-auto flex flex-col gap-4",
        elements: [
          createFAQ(
            "How quickly can I launch a site?",
            "You can launch a simple site in minutes using templates.",
          ),
          createFAQ(
            "Can I export code?",
            "Yes — export static assets or connect your preferred hosting in a few clicks.",
          ),
          createFAQ(
            "Is there a free tier?",
            "Yes, our Starter plan is free for individual use and testing.",
          ),
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/**
 * Newsletter section
 */
export const NewsletterSectionComponent = {
  component: {
    type: "Section",
    id: "newsletter",
    name: "Newsletter",
    role: "region",
    ariaLabel: "Newsletter signup",
    content: "",
    tailwindStyles:
      "w-full py-10 px-4 md:px-8 bg-accent text-accent-foreground",
    elements: [
      {
        type: "Frame",
        name: "NewsletterInner",
        content: "",
        tailwindStyles:
          "max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4",
        elements: [
          {
            type: "Text",
            content: "Stay in the loop",
            tailwindStyles: "text-lg font-semibold",
          },
          {
            type: "Text",
            content:
              "Get product updates, templates and tips sent to your inbox.",
            tailwindStyles: "text-sm text-accent-foreground/90 max-w-md",
          },
          {
            type: "Frame",
            name: "NewsletterForm",
            content: "",
            tailwindStyles: "flex gap-2 w-full md:w-auto",
            elements: [
              {
                type: "Input",
                name: "email",
                content: "",
                tailwindStyles:
                  "px-4 py-2 rounded-md border border-border bg-card",
                placeholder: "you@example.com",
              },
              {
                type: "Button",
                content: "Subscribe",
                buttonType: "button",
                tailwindStyles:
                  "bg-primary text-primary-foreground px-4 py-2 rounded-md",
                styles: {
                  default: {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                  },
                },
              },
            ],
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/**
 * Footer section
 */
export const FooterSectionComponent = {
  component: {
    type: "Section",
    id: "footer",
    name: "Footer",
    role: "contentinfo",
    ariaLabel: "Website footer",
    content: "",
    tailwindStyles: "w-full py-12 px-4 md:px-8 bg-card",
    styles: { default: { backgroundColor: "var(--color-card)" } },
    elements: [
      {
        type: "Frame",
        name: "FooterInner",
        content: "",
        tailwindStyles:
          "max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6",
        elements: [
          {
            type: "Frame",
            name: "FooterBrand",
            content: "",
            tailwindStyles: "flex flex-col gap-3",
            elements: [
              {
                type: "Image",
                content: "Logo",
                src: "",
                alt: "Company logo",
                loading: "eager",
                decoding: "sync",
                width: 120,
                height: 36,
                objectFit: "contain",
                tailwindStyles: "h-9 w-auto",
              },
              {
                type: "Text",
                content: "Build and ship beautiful websites faster.",
                tailwindStyles: "text-sm text-muted-foreground",
              },
            ],
          },
          {
            type: "Frame",
            name: "FooterLinks",
            content: "",
            tailwindStyles: "flex gap-6",
            elements: [
              {
                type: "Frame",
                name: "LinksCol",
                content: "",
                tailwindStyles: "flex flex-col gap-2",
                elements: [
                  {
                    type: "Text",
                    content: "Product",
                    tailwindStyles: "font-semibold text-foreground",
                  },
                  {
                    type: "Link",
                    content: "Templates",
                    href: "/templates",
                    tailwindStyles: "text-sm text-muted-foreground",
                  },
                  {
                    type: "Link",
                    content: "Pricing",
                    href: "/pricing",
                    tailwindStyles: "text-sm text-muted-foreground",
                  },
                  {
                    type: "Link",
                    content: "Docs",
                    href: "/docs",
                    tailwindStyles: "text-sm text-muted-foreground",
                  },
                ],
              },
            ],
          },
          {
            type: "Frame",
            name: "FooterLegal",
            content: "",
            tailwindStyles: "flex flex-col gap-2",
            elements: [
              {
                type: "Text",
                content: "© 2025 WebBuilder",
                tailwindStyles: "text-sm text-muted-foreground",
              },
              {
                type: "Link",
                content: "Privacy",
                href: "/privacy",
                tailwindStyles: "text-sm text-muted-foreground",
              },
              {
                type: "Link",
                content: "Terms",
                href: "/terms",
                tailwindStyles: "text-sm text-muted-foreground",
              },
            ],
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/* -------------------------------------------------------------------------- */
/* -------------------------- Convenience exports --------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * All sections in an array so consumers can easily iterate and assemble pages.
 */
export const landingPageSections = [
  NavbarSectionComponent,
  HeroSectionComponent,
  FeaturesSectionComponent,
  StatsSectionComponent,
  TestimonialsSectionComponent,
  PricingSectionComponent,
  FAQSectionComponent,
  NewsletterSectionComponent,
  FooterSectionComponent,
] as unknown as CustomComponent[];
