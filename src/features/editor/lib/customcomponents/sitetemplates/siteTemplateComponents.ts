import { v4 as uuidv4 } from "uuid";
import { CustomComponent } from "../customComponents";

function mkId(prefix: string) {
  return `${prefix}-${uuidv4().slice(0, 8)}`;
}

/* -------------------------------------------------------------------------- */
/* ----------------------------- Portfolio Site ----------------------------- */
/* -------------------------------------------------------------------------- */

export const portfolioSiteTemplate = {
  component: {
    type: "Section",
    id: mkId("portfolio-site"),
    name: "Portfolio Site Template",
    role: "main",
    ariaLabel: "Portfolio Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-background",
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "Portfolio Navbar",
        content: "",
        tailwindStyles:
          "w-full flex items-center justify-between px-6 md:px-12 py-4 bg-background border-b border-border sticky top-0 z-50",
        elements: [
          {
            type: "Image",
            content: "Logo",
            src: "",
            alt: "Portfolio Logo",
            tailwindStyles: "h-10 w-auto object-contain",
            settings: {
              objectFit: "contain",
              loading: "eager",
            },
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-8",
            elements: [
              {
                type: "Link",
                content: "Work",
                href: "#work",
                tailwindStyles:
                  "text-sm text-muted-foreground hover:text-foreground transition-colors",
              },
              {
                type: "Link",
                content: "About",
                href: "#about",
                tailwindStyles:
                  "text-sm text-muted-foreground hover:text-foreground transition-colors",
              },
              {
                type: "Link",
                content: "Services",
                href: "#services",
                tailwindStyles:
                  "text-sm text-muted-foreground hover:text-foreground transition-colors",
              },
              {
                type: "Link",
                content: "Contact",
                href: "#contact",
                tailwindStyles:
                  "text-sm text-muted-foreground hover:text-foreground transition-colors",
              },
            ],
          },
          {
            type: "Button",
            content: "Hire Me",
            tailwindStyles:
              "px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors",
            styles: {
              default: {
                backgroundColor: "#000",
                color: "#fff",
              },
            },
          },
        ],
        href: "",
        src: "",
      },

      // ==================== HERO SECTION ====================
      {
        type: "Section",
        name: "Portfolio Hero",
        content: "",
        role: "region",
        ariaLabel: "Hero section",
        tailwindStyles:
          "w-full px-6 md:px-12 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12",
        elements: [
          {
            type: "Frame",
            name: "Hero Content",
            content: "",
            tailwindStyles: "flex-1 flex flex-col items-start",
            elements: [
              {
                type: "Text",
                content: "Creative Developer & Designer",
                tailwindStyles:
                  "text-sm uppercase tracking-widest text-muted-foreground mb-4",
              },
              {
                type: "Text",
                content: "I craft digital experiences that inspire and engage",
                tailwindStyles:
                  "text-4xl md:text-6xl font-bold text-foreground leading-tight",
              },
              {
                type: "Text",
                content:
                  "Specializing in web development, UI/UX design, and brand identity. Let's build something amazing together.",
                tailwindStyles:
                  "text-lg text-muted-foreground mt-6 max-w-xl leading-relaxed",
              },
              {
                type: "Frame",
                name: "Hero CTA",
                content: "",
                tailwindStyles: "flex items-center gap-4 mt-10",
                elements: [
                  {
                    type: "Button",
                    content: "View Projects",
                    tailwindStyles:
                      "px-6 py-3 bg-foreground text-background rounded-md font-medium hover:bg-foreground/90 transition-colors",
                    styles: {
                      default: {
                        backgroundColor: "#000",
                        color: "#fff",
                      },
                    },
                  },
                  {
                    type: "Button",
                    content: "Get in Touch",
                    tailwindStyles:
                      "px-6 py-3 border border-border rounded-md font-medium hover:bg-accent transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Social Links",
                content: "",
                tailwindStyles: "flex items-center gap-4 mt-8",
                elements: [
                  {
                    type: "Link",
                    content: "GitHub",
                    href: "https://github.com",
                    tailwindStyles:
                      "text-sm text-muted-foreground hover:text-foreground transition-colors underline",
                  },
                  {
                    type: "Link",
                    content: "LinkedIn",
                    href: "https://linkedin.com",
                    tailwindStyles:
                      "text-sm text-muted-foreground hover:text-foreground transition-colors underline",
                  },
                  {
                    type: "Link",
                    content: "Dribbble",
                    href: "https://dribbble.com",
                    tailwindStyles:
                      "text-sm text-muted-foreground hover:text-foreground transition-colors underline",
                  },
                ],
              },
            ],
          },
          {
            type: "Frame",
            name: "Hero Image",
            content: "",
            tailwindStyles: "flex-1 flex items-center justify-center",
            elements: [
              {
                type: "Image",
                content: "Profile Photo",
                src: "",
                alt: "Developer profile photo",
                tailwindStyles:
                  "w-80 h-80 rounded-full object-cover shadow-2xl border-4 border-background",
                settings: {
                  objectFit: "cover",
                  loading: "eager",
                },
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== SERVICES CAROUSEL ====================
      {
        type: "Section",
        name: "Services Section",
        content: "",
        role: "region",
        ariaLabel: "Services section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 bg-muted",
        elements: [
          {
            type: "Text",
            content: "Services",
            tailwindStyles:
              "text-sm uppercase tracking-widest text-muted-foreground mb-2 text-center",
          },
          {
            type: "Text",
            content: "What I Can Do For You",
            tailwindStyles:
              "text-3xl md:text-4xl font-bold text-foreground mb-12 text-center",
          },
          {
            type: "Carousel",
            name: "Services Carousel",
            content: "",
            tailwindStyles: "w-full max-w-6xl mx-auto",
            settings: {
              loop: true,
              autoplay: true,
              autoplaySpeed: 4000,
              slidesToShow: 3,
              withNavigation: true,
              breakpoints: {
                "(max-width: 768px)": { slidesToShow: 1 },
                "(max-width: 1024px)": { slidesToShow: 2 },
              },
            },
            elements: [
              {
                type: "Frame",
                name: "Service Card 1",
                content: "",
                tailwindStyles:
                  "p-8 bg-card rounded-xl border border-border mx-2",
                elements: [
                  {
                    type: "Text",
                    content: "🎨",
                    tailwindStyles: "text-4xl mb-4",
                  },
                  {
                    type: "Text",
                    content: "UI/UX Design",
                    tailwindStyles:
                      "text-xl font-semibold text-foreground mb-2",
                  },
                  {
                    type: "Text",
                    content:
                      "Creating intuitive and beautiful user interfaces that delight users and drive engagement.",
                    tailwindStyles: "text-sm text-muted-foreground",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Service Card 2",
                content: "",
                tailwindStyles:
                  "p-8 bg-card rounded-xl border border-border mx-2",
                elements: [
                  {
                    type: "Text",
                    content: "💻",
                    tailwindStyles: "text-4xl mb-4",
                  },
                  {
                    type: "Text",
                    content: "Web Development",
                    tailwindStyles:
                      "text-xl font-semibold text-foreground mb-2",
                  },
                  {
                    type: "Text",
                    content:
                      "Building fast, responsive, and scalable websites using modern technologies.",
                    tailwindStyles: "text-sm text-muted-foreground",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Service Card 3",
                content: "",
                tailwindStyles:
                  "p-8 bg-card rounded-xl border border-border mx-2",
                elements: [
                  {
                    type: "Text",
                    content: "📱",
                    tailwindStyles: "text-4xl mb-4",
                  },
                  {
                    type: "Text",
                    content: "Mobile Apps",
                    tailwindStyles:
                      "text-xl font-semibold text-foreground mb-2",
                  },
                  {
                    type: "Text",
                    content:
                      "Developing cross-platform mobile applications with React Native.",
                    tailwindStyles: "text-sm text-muted-foreground",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Service Card 4",
                content: "",
                tailwindStyles:
                  "p-8 bg-card rounded-xl border border-border mx-2",
                elements: [
                  {
                    type: "Text",
                    content: "🚀",
                    tailwindStyles: "text-4xl mb-4",
                  },
                  {
                    type: "Text",
                    content: "Performance",
                    tailwindStyles:
                      "text-xl font-semibold text-foreground mb-2",
                  },
                  {
                    type: "Text",
                    content:
                      "Optimizing websites for speed, SEO, and Core Web Vitals.",
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

      // ==================== PROJECTS GRID (CMSContentGrid) ====================
      {
        type: "Section",
        name: "Projects Section",
        content: "",
        role: "region",
        ariaLabel: "Projects section",
        tailwindStyles: "w-full px-6 md:px-12 py-20",
        elements: [
          {
            type: "Text",
            content: "Selected Work",
            tailwindStyles: "text-2xl font-bold text-foreground mb-10",
          },
          {
            type: "CMSContentGrid",
            name: "Projects Grid",
            content: "",
            tailwindStyles:
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            settings: {
              contentTypeId: "projects",
              displayMode: "grid",
              limit: 6,
              sortBy: "createdAt",
              sortOrder: "desc",
              fieldsToShow: ["title", "image", "category"],
            },
            elements: [
              {
                type: "Frame",
                name: "Project Card Template",
                content: "",
                tailwindStyles:
                  "group relative aspect-[4/3] rounded-xl overflow-hidden bg-muted cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Project Image",
                    src: "",
                    alt: "Project preview",
                    tailwindStyles:
                      "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy",
                    },
                  },
                  {
                    type: "Frame",
                    name: "Project Overlay",
                    content: "",
                    tailwindStyles:
                      "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6",
                    elements: [
                      {
                        type: "Text",
                        content: "Project Title",
                        tailwindStyles: "text-xl font-bold text-white",
                      },
                      {
                        type: "Text",
                        content: "Category",
                        tailwindStyles: "text-sm text-white/80 mt-1",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "Frame",
            name: "View All Projects",
            content: "",
            tailwindStyles: "flex justify-center mt-10",
            elements: [
              {
                type: "Button",
                content: "View All Projects →",
                tailwindStyles:
                  "px-6 py-3 border border-border rounded-md font-medium hover:bg-accent transition-colors",
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== TESTIMONIALS LIST ====================
      {
        type: "Section",
        name: "Testimonials Section",
        content: "",
        role: "region",
        ariaLabel: "Testimonials section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 bg-muted",
        elements: [
          {
            type: "Text",
            content: "What Clients Say",
            tailwindStyles:
              "text-3xl md:text-4xl font-bold text-foreground mb-12 text-center",
          },
          {
            type: "List",
            name: "Testimonials List",
            content: "",
            tailwindStyles:
              "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto",
            elements: [
              {
                type: "Frame",
                name: "Testimonial 1",
                content: "",
                tailwindStyles: "p-6 bg-card rounded-xl border border-border",
                elements: [
                  {
                    type: "Text",
                    content:
                      '"Working with John was an absolute pleasure. He delivered beyond our expectations and the attention to detail was remarkable."',
                    tailwindStyles:
                      "text-muted-foreground italic leading-relaxed",
                  },
                  {
                    type: "Frame",
                    name: "Author",
                    content: "",
                    tailwindStyles: "flex items-center gap-3 mt-4",
                    elements: [
                      {
                        type: "Image",
                        content: "Avatar",
                        src: "",
                        alt: "Sarah Johnson",
                        tailwindStyles: "w-10 h-10 rounded-full object-cover",
                        settings: {
                          objectFit: "cover",
                          loading: "lazy",
                        },
                      },
                      {
                        type: "Frame",
                        name: "Author Info",
                        content: "",
                        tailwindStyles: "flex flex-col",
                        elements: [
                          {
                            type: "Text",
                            content: "Sarah Johnson",
                            tailwindStyles:
                              "text-sm font-medium text-foreground",
                          },
                          {
                            type: "Text",
                            content: "CEO, TechStart",
                            tailwindStyles: "text-xs text-muted-foreground",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: "Frame",
                name: "Testimonial 2",
                content: "",
                tailwindStyles: "p-6 bg-card rounded-xl border border-border",
                elements: [
                  {
                    type: "Text",
                    content:
                      '"The website he built for us increased our conversions by 150%. Highly recommend for any serious business."',
                    tailwindStyles:
                      "text-muted-foreground italic leading-relaxed",
                  },
                  {
                    type: "Frame",
                    name: "Author",
                    content: "",
                    tailwindStyles: "flex items-center gap-3 mt-4",
                    elements: [
                      {
                        type: "Image",
                        content: "Avatar",
                        src: "",
                        alt: "Mike Chen",
                        tailwindStyles: "w-10 h-10 rounded-full object-cover",
                        settings: {
                          objectFit: "cover",
                          loading: "lazy",
                        },
                      },
                      {
                        type: "Frame",
                        name: "Author Info",
                        content: "",
                        tailwindStyles: "flex flex-col",
                        elements: [
                          {
                            type: "Text",
                            content: "Mike Chen",
                            tailwindStyles:
                              "text-sm font-medium text-foreground",
                          },
                          {
                            type: "Text",
                            content: "Founder, GrowthLab",
                            tailwindStyles: "text-xs text-muted-foreground",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: "Frame",
                name: "Testimonial 3",
                content: "",
                tailwindStyles: "p-6 bg-card rounded-xl border border-border",
                elements: [
                  {
                    type: "Text",
                    content:
                      '"Professional, creative, and incredibly responsive. Our new brand identity is exactly what we envisioned."',
                    tailwindStyles:
                      "text-muted-foreground italic leading-relaxed",
                  },
                  {
                    type: "Frame",
                    name: "Author",
                    content: "",
                    tailwindStyles: "flex items-center gap-3 mt-4",
                    elements: [
                      {
                        type: "Image",
                        content: "Avatar",
                        src: "",
                        alt: "Emily Davis",
                        tailwindStyles: "w-10 h-10 rounded-full object-cover",
                        settings: {
                          objectFit: "cover",
                          loading: "lazy",
                        },
                      },
                      {
                        type: "Frame",
                        name: "Author Info",
                        content: "",
                        tailwindStyles: "flex flex-col",
                        elements: [
                          {
                            type: "Text",
                            content: "Emily Davis",
                            tailwindStyles:
                              "text-sm font-medium text-foreground",
                          },
                          {
                            type: "Text",
                            content: "CMO, Brandify",
                            tailwindStyles: "text-xs text-muted-foreground",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== CONTACT FORM ====================
      {
        type: "Section",
        name: "Contact Section",
        content: "",
        role: "region",
        ariaLabel: "Contact section",
        tailwindStyles: "w-full px-6 md:px-12 py-20",
        elements: [
          {
            type: "Frame",
            name: "Contact Container",
            content: "",
            tailwindStyles: "max-w-2xl mx-auto text-center",
            elements: [
              {
                type: "Text",
                content: "Let's Work Together",
                tailwindStyles:
                  "text-3xl md:text-4xl font-bold text-foreground mb-4",
              },
              {
                type: "Text",
                content:
                  "Have a project in mind? Fill out the form below and I'll get back to you within 24 hours.",
                tailwindStyles: "text-muted-foreground mb-10",
              },
              {
                type: "Form",
                name: "Contact Form",
                content: "",
                tailwindStyles: "flex flex-col gap-4 text-left",
                settings: {
                  action: "/api/contact",
                  method: "post",
                  validateOnSubmit: true,
                },
                elements: [
                  {
                    type: "Frame",
                    name: "Name Row",
                    content: "",
                    tailwindStyles: "grid grid-cols-1 md:grid-cols-2 gap-4",
                    elements: [
                      {
                        type: "Frame",
                        name: "First Name Field",
                        content: "",
                        tailwindStyles: "flex flex-col gap-2",
                        elements: [
                          {
                            type: "Text",
                            content: "First Name",
                            tailwindStyles:
                              "text-sm font-medium text-foreground",
                          },
                          {
                            type: "Input",
                            name: "firstName",
                            content: "",
                            tailwindStyles:
                              "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary",
                            settings: {
                              type: "text",
                              placeholder: "John",
                              required: true,
                              autoComplete: "given-name",
                            },
                          },
                        ],
                      },
                      {
                        type: "Frame",
                        name: "Last Name Field",
                        content: "",
                        tailwindStyles: "flex flex-col gap-2",
                        elements: [
                          {
                            type: "Text",
                            content: "Last Name",
                            tailwindStyles:
                              "text-sm font-medium text-foreground",
                          },
                          {
                            type: "Input",
                            name: "lastName",
                            content: "",
                            tailwindStyles:
                              "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary",
                            settings: {
                              type: "text",
                              placeholder: "Doe",
                              required: true,
                              autoComplete: "family-name",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "Frame",
                    name: "Email Field",
                    content: "",
                    tailwindStyles: "flex flex-col gap-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Email",
                        tailwindStyles: "text-sm font-medium text-foreground",
                      },
                      {
                        type: "Input",
                        name: "email",
                        content: "",
                        tailwindStyles:
                          "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary",
                        settings: {
                          type: "email",
                          placeholder: "john@example.com",
                          required: true,
                          autoComplete: "email",
                        },
                      },
                    ],
                  },
                  {
                    type: "Frame",
                    name: "Project Type Field",
                    content: "",
                    tailwindStyles: "flex flex-col gap-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Project Type",
                        tailwindStyles: "text-sm font-medium text-foreground",
                      },
                      {
                        type: "Select",
                        name: "projectType",
                        content: "",
                        tailwindStyles:
                          "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary",
                        elements: [
                          {
                            type: "Text",
                            content: "Select a project type",
                          },
                          {
                            type: "Text",
                            content: "Website Design",
                          },
                          {
                            type: "Text",
                            content: "Web Development",
                          },
                          {
                            type: "Text",
                            content: "Mobile App",
                          },
                          {
                            type: "Text",
                            content: "Brand Identity",
                          },
                          {
                            type: "Text",
                            content: "Other",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "Frame",
                    name: "Message Field",
                    content: "",
                    tailwindStyles: "flex flex-col gap-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Message",
                        tailwindStyles: "text-sm font-medium text-foreground",
                      },
                      {
                        type: "Input",
                        name: "message",
                        content: "",
                        tailwindStyles:
                          "px-4 py-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]",
                        settings: {
                          type: "textarea",
                          placeholder: "Tell me about your project...",
                          required: true,
                        },
                      },
                    ],
                  },
                  {
                    type: "Button",
                    content: "Send Message",
                    tailwindStyles:
                      "w-full px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors mt-4",
                    styles: {
                      default: {
                        backgroundColor: "#000",
                        color: "#fff",
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

      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "Portfolio Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-12 py-12 border-t border-border",
        elements: [
          {
            type: "Frame",
            name: "Footer Content",
            content: "",
            tailwindStyles:
              "max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6",
            elements: [
              {
                type: "Frame",
                name: "Footer Left",
                content: "",
                tailwindStyles:
                  "flex flex-col items-center md:items-start gap-2",
                elements: [
                  {
                    type: "Text",
                    content: "John Doe",
                    tailwindStyles: "text-lg font-bold text-foreground",
                  },
                  {
                    type: "Text",
                    content: "© 2024 All rights reserved.",
                    tailwindStyles: "text-sm text-muted-foreground",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Footer Links",
                content: "",
                tailwindStyles: "flex items-center gap-6",
                elements: [
                  {
                    type: "Link",
                    content: "Twitter",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-muted-foreground hover:text-foreground transition-colors",
                  },
                  {
                    type: "Link",
                    content: "LinkedIn",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-muted-foreground hover:text-foreground transition-colors",
                  },
                  {
                    type: "Link",
                    content: "GitHub",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-muted-foreground hover:text-foreground transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Dribbble",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-muted-foreground hover:text-foreground transition-colors",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/* -------------------------------------------------------------------------- */
/* ------------------------------ Agency Site ------------------------------- */
/* -------------------------------------------------------------------------- */

export const agencySiteTemplate = {
  component: {
    type: "Section",
    id: mkId("agency-site"),
    name: "Agency Site Template",
    role: "main",
    ariaLabel: "Digital Agency Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-zinc-950 text-white",
    styles: {
      default: {
        backgroundColor: "#09090b",
        color: "#ffffff",
      },
    },
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "Agency Navbar",
        content: "",
        tailwindStyles:
          "w-full flex items-center justify-between px-6 md:px-16 py-6 bg-transparent",
        elements: [
          {
            type: "Frame",
            name: "Logo",
            content: "",
            tailwindStyles: "flex items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "Logo Icon",
                src: "",
                alt: "Studio Logo",
                tailwindStyles: "w-10 h-10 rounded-lg object-contain",
                settings: {
                  objectFit: "contain",
                  loading: "eager",
                },
              },
              {
                type: "Text",
                content: "STUDIO",
                tailwindStyles: "text-xl font-bold tracking-wider text-white",
              },
            ],
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-10",
            elements: [
              {
                type: "Link",
                content: "Services",
                href: "#services",
                tailwindStyles:
                  "text-sm text-zinc-400 hover:text-white transition-colors",
              },
              {
                type: "Link",
                content: "Work",
                href: "#work",
                tailwindStyles:
                  "text-sm text-zinc-400 hover:text-white transition-colors",
              },
              {
                type: "Link",
                content: "About",
                href: "#about",
                tailwindStyles:
                  "text-sm text-zinc-400 hover:text-white transition-colors",
              },
              {
                type: "Link",
                content: "Careers",
                href: "#careers",
                tailwindStyles:
                  "text-sm text-zinc-400 hover:text-white transition-colors",
              },
            ],
          },
          {
            type: "Button",
            content: "Start a Project",
            tailwindStyles:
              "px-5 py-2.5 bg-violet-600 text-white rounded-full text-sm font-medium hover:bg-violet-500 transition-colors",
            styles: {
              default: {
                backgroundColor: "#7c3aed",
                color: "#fff",
              },
            },
          },
        ],
        href: "",
        src: "",
      },

      // ==================== HERO SECTION ====================
      {
        type: "Section",
        name: "Agency Hero",
        content: "",
        role: "region",
        ariaLabel: "Hero section",
        tailwindStyles:
          "w-full px-6 md:px-16 py-24 md:py-40 flex flex-col items-start",
        elements: [
          {
            type: "Text",
            content: "We are a creative",
            tailwindStyles:
              "text-5xl md:text-7xl font-bold text-white leading-tight",
          },
          {
            type: "Text",
            content: "digital agency",
            tailwindStyles:
              "text-5xl md:text-7xl font-bold text-violet-500 leading-tight",
          },
          {
            type: "Text",
            content:
              "We design and build exceptional digital products, brands, and experiences that drive growth and inspire action.",
            tailwindStyles:
              "text-lg text-zinc-400 mt-8 max-w-xl leading-relaxed",
          },
          {
            type: "Frame",
            name: "Hero Stats",
            content: "",
            tailwindStyles:
              "flex flex-wrap gap-12 mt-16 pt-8 border-t border-zinc-800",
            elements: [
              {
                type: "Frame",
                name: "Stat 1",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "150+",
                    tailwindStyles: "text-4xl font-bold text-white",
                  },
                  {
                    type: "Text",
                    content: "Projects Delivered",
                    tailwindStyles: "text-sm text-zinc-500 mt-1",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Stat 2",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "50+",
                    tailwindStyles: "text-4xl font-bold text-white",
                  },
                  {
                    type: "Text",
                    content: "Happy Clients",
                    tailwindStyles: "text-sm text-zinc-500 mt-1",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Stat 3",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "8+",
                    tailwindStyles: "text-4xl font-bold text-white",
                  },
                  {
                    type: "Text",
                    content: "Years Experience",
                    tailwindStyles: "text-sm text-zinc-500 mt-1",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Stat 4",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "25+",
                    tailwindStyles: "text-4xl font-bold text-white",
                  },
                  {
                    type: "Text",
                    content: "Team Members",
                    tailwindStyles: "text-sm text-zinc-500 mt-1",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== CLIENTS LOGOS CAROUSEL ====================
      {
        type: "Section",
        name: "Clients Section",
        content: "",
        role: "region",
        ariaLabel: "Our clients",
        tailwindStyles: "w-full px-6 md:px-16 py-16 border-y border-zinc-800",
        elements: [
          {
            type: "Text",
            content: "Trusted by leading brands",
            tailwindStyles: "text-sm text-zinc-500 text-center mb-8",
          },
          {
            type: "Carousel",
            name: "Clients Carousel",
            content: "",
            tailwindStyles: "w-full",
            settings: {
              loop: true,
              autoplay: true,
              autoplaySpeed: 2000,
              slidesToShow: 6,
              withNavigation: false,
              breakpoints: {
                "(max-width: 768px)": { slidesToShow: 3 },
                "(max-width: 1024px)": { slidesToShow: 4 },
              },
            },
            elements: [
              {
                type: "Image",
                content: "Client 1",
                src: "",
                alt: "Client logo 1",
                tailwindStyles:
                  "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy",
                },
              },
              {
                type: "Image",
                content: "Client 2",
                src: "",
                alt: "Client logo 2",
                tailwindStyles:
                  "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy",
                },
              },
              {
                type: "Image",
                content: "Client 3",
                src: "",
                alt: "Client logo 3",
                tailwindStyles:
                  "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy",
                },
              },
              {
                type: "Image",
                content: "Client 4",
                src: "",
                alt: "Client logo 4",
                tailwindStyles:
                  "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy",
                },
              },
              {
                type: "Image",
                content: "Client 5",
                src: "",
                alt: "Client logo 5",
                tailwindStyles:
                  "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy",
                },
              },
              {
                type: "Image",
                content: "Client 6",
                src: "",
                alt: "Client logo 6",
                tailwindStyles:
                  "h-8 w-auto opacity-50 hover:opacity-100 transition-opacity mx-auto",
                settings: {
                  objectFit: "contain",
                  loading: "lazy",
                },
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== SERVICES SECTION ====================
      {
        type: "Section",
        name: "Agency Services",
        content: "",
        role: "region",
        ariaLabel: "Our services",
        tailwindStyles: "w-full px-6 md:px-16 py-20 bg-zinc-900",
        styles: {
          default: {
            backgroundColor: "#18181b",
          },
        },
        elements: [
          {
            type: "Text",
            content: "What We Do",
            tailwindStyles:
              "text-sm uppercase tracking-widest text-violet-500 mb-4",
          },
          {
            type: "Text",
            content: "Services designed for growth",
            tailwindStyles: "text-3xl md:text-4xl font-bold text-white mb-12",
          },
          {
            type: "List",
            name: "Services List",
            content: "",
            tailwindStyles:
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
            elements: [
              {
                type: "Frame",
                name: "Service 1",
                content: "",
                tailwindStyles:
                  "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "🎨",
                    tailwindStyles: "text-4xl mb-6",
                  },
                  {
                    type: "Text",
                    content: "Brand Strategy",
                    tailwindStyles: "text-xl font-semibold text-white mb-3",
                  },
                  {
                    type: "Text",
                    content:
                      "We craft compelling brand narratives that resonate with your audience and differentiate you from competitors.",
                    tailwindStyles:
                      "text-sm text-zinc-400 leading-relaxed mb-4",
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-violet-500 group-hover:text-violet-400 transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Service 2",
                content: "",
                tailwindStyles:
                  "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "💻",
                    tailwindStyles: "text-4xl mb-6",
                  },
                  {
                    type: "Text",
                    content: "Web Development",
                    tailwindStyles: "text-xl font-semibold text-white mb-3",
                  },
                  {
                    type: "Text",
                    content:
                      "Custom websites and web applications built with modern technologies for performance and scalability.",
                    tailwindStyles:
                      "text-sm text-zinc-400 leading-relaxed mb-4",
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-violet-500 group-hover:text-violet-400 transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Service 3",
                content: "",
                tailwindStyles:
                  "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "📱",
                    tailwindStyles: "text-4xl mb-6",
                  },
                  {
                    type: "Text",
                    content: "Mobile Apps",
                    tailwindStyles: "text-xl font-semibold text-white mb-3",
                  },
                  {
                    type: "Text",
                    content:
                      "Native and cross-platform mobile applications that deliver exceptional user experiences.",
                    tailwindStyles:
                      "text-sm text-zinc-400 leading-relaxed mb-4",
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-violet-500 group-hover:text-violet-400 transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Service 4",
                content: "",
                tailwindStyles:
                  "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "🎯",
                    tailwindStyles: "text-4xl mb-6",
                  },
                  {
                    type: "Text",
                    content: "Digital Marketing",
                    tailwindStyles: "text-xl font-semibold text-white mb-3",
                  },
                  {
                    type: "Text",
                    content:
                      "Data-driven marketing strategies to increase visibility, engagement, and conversions.",
                    tailwindStyles:
                      "text-sm text-zinc-400 leading-relaxed mb-4",
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-violet-500 group-hover:text-violet-400 transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Service 5",
                content: "",
                tailwindStyles:
                  "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "🔍",
                    tailwindStyles: "text-4xl mb-6",
                  },
                  {
                    type: "Text",
                    content: "SEO Optimization",
                    tailwindStyles: "text-xl font-semibold text-white mb-3",
                  },
                  {
                    type: "Text",
                    content:
                      "Improve your search rankings and organic traffic with our proven SEO strategies.",
                    tailwindStyles:
                      "text-sm text-zinc-400 leading-relaxed mb-4",
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-violet-500 group-hover:text-violet-400 transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Service 6",
                content: "",
                tailwindStyles:
                  "p-8 rounded-2xl bg-zinc-800/50 border border-zinc-800 hover:border-violet-500/50 transition-colors group",
                elements: [
                  {
                    type: "Text",
                    content: "📊",
                    tailwindStyles: "text-4xl mb-6",
                  },
                  {
                    type: "Text",
                    content: "Analytics & Insights",
                    tailwindStyles: "text-xl font-semibold text-white mb-3",
                  },
                  {
                    type: "Text",
                    content:
                      "Turn data into actionable insights with our comprehensive analytics solutions.",
                    tailwindStyles:
                      "text-sm text-zinc-400 leading-relaxed mb-4",
                  },
                  {
                    type: "Link",
                    content: "Learn more →",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-violet-500 group-hover:text-violet-400 transition-colors",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== CASE STUDIES (CMSContentList) ====================
      {
        type: "Section",
        name: "Case Studies Section",
        content: "",
        role: "region",
        ariaLabel: "Case studies",
        tailwindStyles: "w-full px-6 md:px-16 py-20",
        elements: [
          {
            type: "Frame",
            name: "Section Header",
            content: "",
            tailwindStyles: "flex items-center justify-between mb-12",
            elements: [
              {
                type: "Frame",
                name: "Header Left",
                content: "",
                tailwindStyles: "flex flex-col",
                elements: [
                  {
                    type: "Text",
                    content: "Our Work",
                    tailwindStyles:
                      "text-sm uppercase tracking-widest text-violet-500 mb-2",
                  },
                  {
                    type: "Text",
                    content: "Featured Case Studies",
                    tailwindStyles: "text-3xl md:text-4xl font-bold text-white",
                  },
                ],
              },
              {
                type: "Button",
                content: "View All Work →",
                tailwindStyles:
                  "px-5 py-2.5 border border-zinc-700 text-white rounded-full text-sm hover:bg-zinc-800 transition-colors hidden md:block",
              },
            ],
          },
          {
            type: "CMSContentList",
            name: "Case Studies List",
            content: "",
            tailwindStyles: "flex flex-col gap-8",
            settings: {
              contentTypeId: "caseStudies",
              displayMode: "list",
              limit: 3,
              sortBy: "createdAt",
              sortOrder: "desc",
              fieldsToShow: [
                "title",
                "description",
                "image",
                "category",
                "results",
              ],
            },
            elements: [
              {
                type: "Frame",
                name: "Case Study Template",
                content: "",
                tailwindStyles:
                  "flex flex-col md:flex-row gap-8 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-colors",
                elements: [
                  {
                    type: "Image",
                    content: "Case Study Image",
                    src: "",
                    alt: "Case study preview",
                    tailwindStyles:
                      "w-full md:w-1/2 aspect-video rounded-xl object-cover",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy",
                    },
                  },
                  {
                    type: "Frame",
                    name: "Case Study Content",
                    content: "",
                    tailwindStyles: "flex-1 flex flex-col justify-center",
                    elements: [
                      {
                        type: "Text",
                        content: "E-Commerce",
                        tailwindStyles: "text-sm text-violet-500 mb-2",
                      },
                      {
                        type: "Text",
                        content:
                          "Redesigning the shopping experience for TechMart",
                        tailwindStyles: "text-2xl font-bold text-white mb-4",
                      },
                      {
                        type: "Text",
                        content:
                          "We helped TechMart increase their online sales by 200% through a complete redesign of their e-commerce platform.",
                        tailwindStyles: "text-zinc-400 leading-relaxed mb-6",
                      },
                      {
                        type: "Frame",
                        name: "Results",
                        content: "",
                        tailwindStyles: "flex gap-8",
                        elements: [
                          {
                            type: "Frame",
                            name: "Result 1",
                            content: "",
                            tailwindStyles: "flex flex-col",
                            elements: [
                              {
                                type: "Text",
                                content: "+200%",
                                tailwindStyles:
                                  "text-2xl font-bold text-violet-500",
                              },
                              {
                                type: "Text",
                                content: "Sales Increase",
                                tailwindStyles: "text-sm text-zinc-500",
                              },
                            ],
                          },
                          {
                            type: "Frame",
                            name: "Result 2",
                            content: "",
                            tailwindStyles: "flex flex-col",
                            elements: [
                              {
                                type: "Text",
                                content: "+85%",
                                tailwindStyles:
                                  "text-2xl font-bold text-violet-500",
                              },
                              {
                                type: "Text",
                                content: "User Engagement",
                                tailwindStyles: "text-sm text-zinc-500",
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== TEAM SECTION ====================
      {
        type: "Section",
        name: "Team Section",
        content: "",
        role: "region",
        ariaLabel: "Our team",
        tailwindStyles: "w-full px-6 md:px-16 py-20 bg-zinc-900",
        styles: {
          default: {
            backgroundColor: "#18181b",
          },
        },
        elements: [
          {
            type: "Text",
            content: "Meet the Team",
            tailwindStyles:
              "text-3xl md:text-4xl font-bold text-white mb-12 text-center",
          },
          {
            type: "List",
            name: "Team List",
            content: "",
            tailwindStyles: "grid grid-cols-2 md:grid-cols-4 gap-6",
            elements: [
              {
                type: "Frame",
                name: "Team Member 1",
                content: "",
                tailwindStyles: "flex flex-col items-center text-center group",
                elements: [
                  {
                    type: "Image",
                    content: "Team Member 1",
                    src: "",
                    alt: "Alex Thompson",
                    tailwindStyles:
                      "w-32 h-32 rounded-full object-cover mb-4 group-hover:ring-4 ring-violet-500 transition-all",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy",
                    },
                  },
                  {
                    type: "Text",
                    content: "Alex Thompson",
                    tailwindStyles: "text-lg font-semibold text-white",
                  },
                  {
                    type: "Text",
                    content: "CEO & Founder",
                    tailwindStyles: "text-sm text-zinc-500",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Team Member 2",
                content: "",
                tailwindStyles: "flex flex-col items-center text-center group",
                elements: [
                  {
                    type: "Image",
                    content: "Team Member 2",
                    src: "",
                    alt: "Sarah Chen",
                    tailwindStyles:
                      "w-32 h-32 rounded-full object-cover mb-4 group-hover:ring-4 ring-violet-500 transition-all",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy",
                    },
                  },
                  {
                    type: "Text",
                    content: "Sarah Chen",
                    tailwindStyles: "text-lg font-semibold text-white",
                  },
                  {
                    type: "Text",
                    content: "Creative Director",
                    tailwindStyles: "text-sm text-zinc-500",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Team Member 3",
                content: "",
                tailwindStyles: "flex flex-col items-center text-center group",
                elements: [
                  {
                    type: "Image",
                    content: "Team Member 3",
                    src: "",
                    alt: "Michael Park",
                    tailwindStyles:
                      "w-32 h-32 rounded-full object-cover mb-4 group-hover:ring-4 ring-violet-500 transition-all",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy",
                    },
                  },
                  {
                    type: "Text",
                    content: "Michael Park",
                    tailwindStyles: "text-lg font-semibold text-white",
                  },
                  {
                    type: "Text",
                    content: "Lead Developer",
                    tailwindStyles: "text-sm text-zinc-500",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Team Member 4",
                content: "",
                tailwindStyles: "flex flex-col items-center text-center group",
                elements: [
                  {
                    type: "Image",
                    content: "Team Member 4",
                    src: "",
                    alt: "Emma Wilson",
                    tailwindStyles:
                      "w-32 h-32 rounded-full object-cover mb-4 group-hover:ring-4 ring-violet-500 transition-all",
                    settings: {
                      objectFit: "cover",
                      loading: "lazy",
                    },
                  },
                  {
                    type: "Text",
                    content: "Emma Wilson",
                    tailwindStyles: "text-lg font-semibold text-white",
                  },
                  {
                    type: "Text",
                    content: "Marketing Lead",
                    tailwindStyles: "text-sm text-zinc-500",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== CONTACT CTA ====================
      {
        type: "Section",
        name: "Agency CTA",
        content: "",
        role: "region",
        ariaLabel: "Contact section",
        tailwindStyles:
          "w-full px-6 md:px-16 py-24 flex flex-col items-center text-center",
        elements: [
          {
            type: "Text",
            content: "Ready to start your project?",
            tailwindStyles: "text-4xl md:text-5xl font-bold text-white mb-6",
          },
          {
            type: "Text",
            content: "Let's discuss how we can help bring your vision to life.",
            tailwindStyles: "text-lg text-zinc-400 mb-10 max-w-xl",
          },
          {
            type: "Frame",
            name: "CTA Buttons",
            content: "",
            tailwindStyles: "flex flex-col sm:flex-row items-center gap-4",
            elements: [
              {
                type: "Button",
                content: "Start a Project →",
                tailwindStyles:
                  "px-8 py-4 bg-violet-600 text-white rounded-full text-lg font-medium hover:bg-violet-500 transition-colors",
                styles: {
                  default: {
                    backgroundColor: "#7c3aed",
                    color: "#fff",
                  },
                },
              },
              {
                type: "Button",
                content: "Schedule a Call",
                tailwindStyles:
                  "px-8 py-4 border border-zinc-700 text-white rounded-full text-lg hover:bg-zinc-800 transition-colors",
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "Agency Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-16 py-12 border-t border-zinc-800",
        elements: [
          {
            type: "Frame",
            name: "Footer Content",
            content: "",
            tailwindStyles: "grid grid-cols-2 md:grid-cols-4 gap-8 mb-12",
            elements: [
              {
                type: "Frame",
                name: "Brand Column",
                content: "",
                tailwindStyles: "col-span-2 md:col-span-1",
                elements: [
                  {
                    type: "Frame",
                    name: "Logo",
                    content: "",
                    tailwindStyles: "flex items-center gap-2 mb-4",
                    elements: [
                      {
                        type: "Image",
                        content: "Logo",
                        src: "",
                        alt: "Studio Logo",
                        tailwindStyles: "w-8 h-8 rounded-lg",
                        settings: {
                          objectFit: "contain",
                          loading: "lazy",
                        },
                      },
                      {
                        type: "Text",
                        content: "STUDIO",
                        tailwindStyles: "text-lg font-bold text-white",
                      },
                    ],
                  },
                  {
                    type: "Text",
                    content:
                      "Building exceptional digital experiences since 2016.",
                    tailwindStyles: "text-sm text-zinc-500",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Services Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Services",
                    tailwindStyles: "text-sm font-semibold text-white mb-2",
                  },
                  {
                    type: "Link",
                    content: "Brand Strategy",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Web Development",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Mobile Apps",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Company Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Company",
                    tailwindStyles: "text-sm font-semibold text-white mb-2",
                  },
                  {
                    type: "Link",
                    content: "About",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Careers",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Contact",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Social Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Follow Us",
                    tailwindStyles: "text-sm font-semibold text-white mb-2",
                  },
                  {
                    type: "Link",
                    content: "Twitter",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "LinkedIn",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Dribbble",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                ],
              },
            ],
          },
          {
            type: "Frame",
            name: "Footer Bottom",
            content: "",
            tailwindStyles:
              "pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4",
            elements: [
              {
                type: "Text",
                content: "© 2024 Studio Agency. All rights reserved.",
                tailwindStyles: "text-sm text-zinc-500",
              },
              {
                type: "Frame",
                name: "Legal Links",
                content: "",
                tailwindStyles: "flex items-center gap-6",
                elements: [
                  {
                    type: "Link",
                    content: "Privacy Policy",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Terms of Service",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-zinc-500 hover:text-white transition-colors",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/* -------------------------------------------------------------------------- */
/* -------------------------------- SaaS Site ------------------------------- */
/* -------------------------------------------------------------------------- */

export const saasSiteTemplate = {
  component: {
    type: "Section",
    id: mkId("saas-site"),
    name: "SaaS Site Template",
    role: "main",
    ariaLabel: "SaaS Product Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-slate-50",
    styles: {
      default: {
        backgroundColor: "#f8fafc",
      },
    },
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "SaaS Navbar",
        content: "",
        tailwindStyles:
          "w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-slate-200 sticky top-0 z-50",
        styles: {
          default: {
            backgroundColor: "#fff",
          },
        },
        elements: [
          {
            type: "Frame",
            name: "Logo",
            content: "",
            tailwindStyles: "flex items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "Logo",
                src: "",
                alt: "FlowSync Logo",
                tailwindStyles: "w-8 h-8 rounded-lg",
                settings: {
                  objectFit: "contain",
                  loading: "eager",
                },
              },
              {
                type: "Text",
                content: "FlowSync",
                tailwindStyles: "text-xl font-bold text-slate-900",
              },
            ],
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-8",
            elements: [
              {
                type: "Link",
                content: "Features",
                href: "#features",
                tailwindStyles:
                  "text-sm text-slate-600 hover:text-slate-900 transition-colors",
              },
              {
                type: "Link",
                content: "Pricing",
                href: "#pricing",
                tailwindStyles:
                  "text-sm text-slate-600 hover:text-slate-900 transition-colors",
              },
              {
                type: "Link",
                content: "Docs",
                href: "#",
                tailwindStyles:
                  "text-sm text-slate-600 hover:text-slate-900 transition-colors",
              },
              {
                type: "Link",
                content: "Blog",
                href: "#",
                tailwindStyles:
                  "text-sm text-slate-600 hover:text-slate-900 transition-colors",
              },
            ],
          },
          {
            type: "Frame",
            name: "Auth Buttons",
            content: "",
            tailwindStyles: "flex items-center gap-3",
            elements: [
              {
                type: "Button",
                content: "Sign In",
                tailwindStyles:
                  "px-4 py-2 text-sm text-slate-700 hover:text-slate-900 transition-colors",
              },
              {
                type: "Button",
                content: "Get Started Free",
                tailwindStyles:
                  "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors",
                styles: {
                  default: {
                    backgroundColor: "#2563eb",
                    color: "#fff",
                  },
                },
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== HERO ====================
      {
        type: "Section",
        name: "SaaS Hero",
        content: "",
        role: "region",
        ariaLabel: "Hero section",
        tailwindStyles:
          "w-full px-6 md:px-12 py-20 md:py-28 flex flex-col items-center text-center",
        elements: [
          {
            type: "Frame",
            name: "Badge",
            content: "",
            tailwindStyles: "px-4 py-1.5 bg-blue-100 rounded-full mb-6",
            elements: [
              {
                type: "Text",
                content: "🎉 New: AI-powered automation is here",
                tailwindStyles: "text-sm text-blue-700 font-medium",
              },
            ],
          },
          {
            type: "Text",
            content: "Streamline your workflow with intelligent automation",
            tailwindStyles:
              "text-4xl md:text-6xl font-bold text-slate-900 leading-tight max-w-4xl",
          },
          {
            type: "Text",
            content:
              "FlowSync helps teams automate repetitive tasks, integrate their favorite tools, and focus on what matters most.",
            tailwindStyles:
              "text-lg text-slate-600 mt-6 max-w-2xl leading-relaxed",
          },
          {
            type: "Frame",
            name: "Hero CTA",
            content: "",
            tailwindStyles:
              "flex flex-col sm:flex-row items-center gap-4 mt-10",
            elements: [
              {
                type: "Button",
                content: "Start Free Trial",
                tailwindStyles:
                  "px-8 py-3.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25",
                styles: {
                  default: {
                    backgroundColor: "#2563eb",
                    color: "#fff",
                  },
                },
              },
              {
                type: "Button",
                content: "Watch Demo →",
                tailwindStyles:
                  "px-8 py-3.5 text-slate-700 font-medium hover:text-slate-900 transition-colors",
              },
            ],
          },
          {
            type: "Text",
            content: "No credit card required • 14-day free trial",
            tailwindStyles: "text-sm text-slate-500 mt-4",
          },
          {
            type: "Image",
            content: "Product Screenshot",
            src: "",
            alt: "FlowSync dashboard",
            tailwindStyles:
              "w-full max-w-5xl mt-16 rounded-xl shadow-2xl border border-slate-200",
            settings: {
              objectFit: "cover",
              loading: "lazy",
            },
          },
        ],
        href: "",
        src: "",
      },

      // ==================== FEATURES ====================
      {
        type: "Section",
        name: "SaaS Features",
        content: "",
        role: "region",
        ariaLabel: "Features section",
        tailwindStyles: "w-full px-6 md:px-12 py-20",
        elements: [
          {
            type: "Frame",
            name: "Section Header",
            content: "",
            tailwindStyles: "text-center mb-16",
            elements: [
              {
                type: "Text",
                content: "Everything you need",
                tailwindStyles: "text-3xl md:text-4xl font-bold text-slate-900",
              },
              {
                type: "Text",
                content:
                  "Powerful features to help you manage and automate your entire workflow.",
                tailwindStyles: "text-lg text-slate-600 mt-4 max-w-xl mx-auto",
              },
            ],
          },
          {
            type: "List",
            name: "Features List",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-3 gap-8",
            elements: [
              {
                type: "Frame",
                name: "Feature 1",
                content: "",
                tailwindStyles:
                  "p-6 bg-white rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "⚡",
                    tailwindStyles: "text-4xl mb-4",
                  },
                  {
                    type: "Text",
                    content: "Lightning Fast",
                    tailwindStyles: "text-lg font-semibold text-slate-900 mb-2",
                  },
                  {
                    type: "Text",
                    content:
                      "Execute workflows in milliseconds with our optimized infrastructure.",
                    tailwindStyles: "text-sm text-slate-600 leading-relaxed",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Feature 2",
                content: "",
                tailwindStyles:
                  "p-6 bg-white rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "🔗",
                    tailwindStyles: "text-4xl mb-4",
                  },
                  {
                    type: "Text",
                    content: "500+ Integrations",
                    tailwindStyles: "text-lg font-semibold text-slate-900 mb-2",
                  },
                  {
                    type: "Text",
                    content:
                      "Connect with all your favorite tools and services seamlessly.",
                    tailwindStyles: "text-sm text-slate-600 leading-relaxed",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Feature 3",
                content: "",
                tailwindStyles:
                  "p-6 bg-white rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "🤖",
                    tailwindStyles: "text-4xl mb-4",
                  },
                  {
                    type: "Text",
                    content: "AI-Powered",
                    tailwindStyles: "text-lg font-semibold text-slate-900 mb-2",
                  },
                  {
                    type: "Text",
                    content:
                      "Let AI suggest and optimize your workflows automatically.",
                    tailwindStyles: "text-sm text-slate-600 leading-relaxed",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== PRICING ====================
      {
        type: "Section",
        name: "SaaS Pricing",
        content: "",
        role: "region",
        ariaLabel: "Pricing section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 bg-white",
        styles: {
          default: {
            backgroundColor: "#fff",
          },
        },
        elements: [
          {
            type: "Frame",
            name: "Section Header",
            content: "",
            tailwindStyles: "text-center mb-12",
            elements: [
              {
                type: "Text",
                content: "Simple, transparent pricing",
                tailwindStyles: "text-3xl md:text-4xl font-bold text-slate-900",
              },
              {
                type: "Text",
                content: "Choose the plan that works best for your team.",
                tailwindStyles: "text-lg text-slate-600 mt-4",
              },
            ],
          },
          {
            type: "List",
            name: "Pricing Plans",
            content: "",
            tailwindStyles:
              "grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto",
            elements: [
              {
                type: "Frame",
                name: "Starter Plan",
                content: "",
                tailwindStyles:
                  "p-8 bg-slate-50 rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "Starter",
                    tailwindStyles: "text-lg font-semibold text-slate-900",
                  },
                  {
                    type: "Text",
                    content: "$0",
                    tailwindStyles: "text-4xl font-bold text-slate-900 mt-4",
                  },
                  {
                    type: "Text",
                    content: "/month",
                    tailwindStyles: "text-slate-600",
                  },
                  {
                    type: "Button",
                    content: "Get Started",
                    tailwindStyles:
                      "w-full px-4 py-3 mt-6 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors",
                  },
                  {
                    type: "List",
                    name: "Features",
                    content: "",
                    tailwindStyles: "mt-8 flex flex-col gap-3",
                    elements: [
                      {
                        type: "Text",
                        content: "✓ 100 tasks/month",
                        tailwindStyles: "text-sm text-slate-600",
                      },
                      {
                        type: "Text",
                        content: "✓ 3 workflows",
                        tailwindStyles: "text-sm text-slate-600",
                      },
                      {
                        type: "Text",
                        content: "✓ Basic integrations",
                        tailwindStyles: "text-sm text-slate-600",
                      },
                    ],
                  },
                ],
              },
              {
                type: "Frame",
                name: "Pro Plan",
                content: "",
                tailwindStyles: "p-8 bg-blue-600 rounded-2xl relative",
                styles: {
                  default: {
                    backgroundColor: "#2563eb",
                  },
                },
                elements: [
                  {
                    type: "Text",
                    content: "Most Popular",
                    tailwindStyles:
                      "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 rounded-full text-xs font-semibold text-yellow-900",
                  },
                  {
                    type: "Text",
                    content: "Pro",
                    tailwindStyles: "text-lg font-semibold text-white",
                  },
                  {
                    type: "Text",
                    content: "$29",
                    tailwindStyles: "text-4xl font-bold text-white mt-4",
                  },
                  {
                    type: "Text",
                    content: "/month",
                    tailwindStyles: "text-blue-200",
                  },
                  {
                    type: "Button",
                    content: "Start Free Trial",
                    tailwindStyles:
                      "w-full px-4 py-3 mt-6 bg-white rounded-lg font-medium text-blue-600 hover:bg-blue-50 transition-colors",
                    styles: {
                      default: {
                        backgroundColor: "#fff",
                        color: "#2563eb",
                      },
                    },
                  },
                  {
                    type: "List",
                    name: "Features",
                    content: "",
                    tailwindStyles: "mt-8 flex flex-col gap-3",
                    elements: [
                      {
                        type: "Text",
                        content: "✓ Unlimited tasks",
                        tailwindStyles: "text-sm text-white",
                      },
                      {
                        type: "Text",
                        content: "✓ Unlimited workflows",
                        tailwindStyles: "text-sm text-white",
                      },
                      {
                        type: "Text",
                        content: "✓ All integrations",
                        tailwindStyles: "text-sm text-white",
                      },
                      {
                        type: "Text",
                        content: "✓ Priority support",
                        tailwindStyles: "text-sm text-white",
                      },
                    ],
                  },
                ],
              },
              {
                type: "Frame",
                name: "Enterprise Plan",
                content: "",
                tailwindStyles:
                  "p-8 bg-slate-50 rounded-2xl border border-slate-200",
                elements: [
                  {
                    type: "Text",
                    content: "Enterprise",
                    tailwindStyles: "text-lg font-semibold text-slate-900",
                  },
                  {
                    type: "Text",
                    content: "Custom",
                    tailwindStyles: "text-4xl font-bold text-slate-900 mt-4",
                  },
                  {
                    type: "Button",
                    content: "Contact Sales",
                    tailwindStyles:
                      "w-full px-4 py-3 mt-6 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors",
                  },
                  {
                    type: "List",
                    name: "Features",
                    content: "",
                    tailwindStyles: "mt-8 flex flex-col gap-3",
                    elements: [
                      {
                        type: "Text",
                        content: "✓ Everything in Pro",
                        tailwindStyles: "text-sm text-slate-600",
                      },
                      {
                        type: "Text",
                        content: "✓ SSO & SAML",
                        tailwindStyles: "text-sm text-slate-600",
                      },
                      {
                        type: "Text",
                        content: "✓ Dedicated support",
                        tailwindStyles: "text-sm text-slate-600",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== NEWSLETTER FORM ====================
      {
        type: "Section",
        name: "SaaS Newsletter",
        content: "",
        role: "region",
        ariaLabel: "Newsletter section",
        tailwindStyles: "w-full px-6 md:px-12 py-20 bg-slate-100",
        elements: [
          {
            type: "Frame",
            name: "Newsletter Container",
            content: "",
            tailwindStyles: "max-w-2xl mx-auto text-center",
            elements: [
              {
                type: "Text",
                content: "Stay in the loop",
                tailwindStyles: "text-2xl font-bold text-slate-900 mb-2",
              },
              {
                type: "Text",
                content:
                  "Get product updates, tips, and insights delivered to your inbox.",
                tailwindStyles: "text-slate-600 mb-8",
              },
              {
                type: "Form",
                name: "Newsletter Form",
                content: "",
                tailwindStyles: "flex flex-col sm:flex-row gap-3",
                settings: {
                  action: "/api/newsletter",
                  method: "post",
                },
                elements: [
                  {
                    type: "Input",
                    name: "email",
                    content: "",
                    tailwindStyles:
                      "flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                    settings: {
                      type: "email",
                      placeholder: "Enter your email",
                      required: true,
                    },
                  },
                  {
                    type: "Button",
                    content: "Subscribe",
                    tailwindStyles:
                      "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors",
                    styles: {
                      default: {
                        backgroundColor: "#2563eb",
                        color: "#fff",
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

      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "SaaS Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-12 py-12 bg-slate-900 text-white",
        styles: {
          default: {
            backgroundColor: "#0f172a",
          },
        },
        elements: [
          {
            type: "Frame",
            name: "Footer Bottom",
            content: "",
            tailwindStyles:
              "flex flex-col md:flex-row items-center justify-between gap-4",
            elements: [
              {
                type: "Text",
                content: "© 2024 FlowSync. All rights reserved.",
                tailwindStyles: "text-sm text-slate-500",
              },
              {
                type: "Frame",
                name: "Footer Links",
                content: "",
                tailwindStyles: "flex items-center gap-6",
                elements: [
                  {
                    type: "Link",
                    content: "Privacy",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-slate-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Terms",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-slate-500 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Contact",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-slate-500 hover:text-white transition-colors",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/* -------------------------------------------------------------------------- */
/* ------------------------------- Blog Site -------------------------------- */
/* -------------------------------------------------------------------------- */

export const blogSiteTemplate = {
  component: {
    type: "Section",
    id: mkId("blog-site"),
    name: "Blog Site Template",
    role: "main",
    ariaLabel: "Blog Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-white",
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "Blog Navbar",
        content: "",
        tailwindStyles:
          "w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100",
        elements: [
          {
            type: "Text",
            content: "The Daily Read",
            tailwindStyles:
              "text-2xl font-serif font-bold text-gray-900 italic",
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-8",
            elements: [
              {
                type: "Link",
                content: "Home",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-600 hover:text-gray-900 transition-colors",
              },
              {
                type: "Link",
                content: "Technology",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-600 hover:text-gray-900 transition-colors",
              },
              {
                type: "Link",
                content: "Lifestyle",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-600 hover:text-gray-900 transition-colors",
              },
              {
                type: "Link",
                content: "Travel",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-600 hover:text-gray-900 transition-colors",
              },
            ],
          },
          {
            type: "Button",
            content: "Subscribe",
            tailwindStyles:
              "px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors",
            styles: { default: { backgroundColor: "#111827", color: "#fff" } },
          },
        ],
        href: "",
        src: "",
      },

      // ==================== FEATURED POST ====================
      {
        type: "Section",
        name: "Featured Post",
        content: "",
        role: "region",
        ariaLabel: "Featured article",
        tailwindStyles:
          "w-full px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-2 gap-8",
        elements: [
          {
            type: "Image",
            content: "Featured Post Image",
            src: "",
            alt: "Featured blog post",
            tailwindStyles: "aspect-[4/3] rounded-2xl object-cover w-full",
            settings: { objectFit: "cover", loading: "eager" },
          },
          {
            type: "Frame",
            name: "Featured Content",
            content: "",
            tailwindStyles: "flex flex-col justify-center",
            elements: [
              {
                type: "Text",
                content: "Featured",
                tailwindStyles:
                  "px-3 py-1 bg-amber-100 rounded-full text-xs font-medium text-amber-700 uppercase w-fit mb-4",
              },
              {
                type: "Text",
                content:
                  "The Future of Remote Work: How Technology is Reshaping Our Offices",
                tailwindStyles:
                  "text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight",
              },
              {
                type: "Text",
                content:
                  "Explore how the global shift to remote work is changing everything from office design to team collaboration.",
                tailwindStyles: "text-gray-600 mt-4 leading-relaxed",
              },
              {
                type: "Frame",
                name: "Author",
                content: "",
                tailwindStyles: "flex items-center gap-3 mt-6",
                elements: [
                  {
                    type: "Image",
                    content: "Author Avatar",
                    src: "",
                    alt: "Author",
                    tailwindStyles: "w-10 h-10 rounded-full object-cover",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Frame",
                    name: "Author Info",
                    content: "",
                    tailwindStyles: "flex flex-col",
                    elements: [
                      {
                        type: "Text",
                        content: "Sarah Johnson",
                        tailwindStyles: "text-sm font-medium text-gray-900",
                      },
                      {
                        type: "Text",
                        content: "March 15, 2024 • 8 min read",
                        tailwindStyles: "text-xs text-gray-500",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== BLOG POSTS GRID ====================
      {
        type: "Section",
        name: "Blog Posts",
        content: "",
        role: "region",
        ariaLabel: "Latest articles",
        tailwindStyles: "w-full px-6 md:px-12 py-12",
        elements: [
          {
            type: "Text",
            content: "Latest Articles",
            tailwindStyles: "text-2xl font-serif font-bold text-gray-900 mb-8",
          },
          {
            type: "CMSContentGrid",
            name: "Posts Grid",
            content: "",
            tailwindStyles: "grid grid-cols-1 md:grid-cols-3 gap-8",
            settings: {
              contentTypeId: "blogPosts",
              displayMode: "grid",
              limit: 6,
              sortBy: "createdAt",
              sortOrder: "desc",
            },
            elements: [
              {
                type: "Frame",
                name: "Post Card Template",
                content: "",
                tailwindStyles: "flex flex-col cursor-pointer group",
                elements: [
                  {
                    type: "Image",
                    content: "Post Image",
                    src: "",
                    alt: "Blog post",
                    tailwindStyles:
                      "aspect-[3/2] rounded-xl object-cover mb-4 group-hover:scale-105 transition-transform duration-300",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Text",
                    content: "Category",
                    tailwindStyles:
                      "text-xs font-medium text-blue-600 uppercase tracking-wide mb-2",
                  },
                  {
                    type: "Text",
                    content: "Article Title Here",
                    tailwindStyles:
                      "text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors",
                  },
                  {
                    type: "Text",
                    content: "March 10, 2024",
                    tailwindStyles: "text-sm text-gray-500 mt-2",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== NEWSLETTER ====================
      {
        type: "Section",
        name: "Blog Newsletter",
        content: "",
        role: "region",
        ariaLabel: "Newsletter",
        tailwindStyles:
          "w-full px-6 md:px-12 py-16 bg-gray-50 flex flex-col items-center text-center",
        elements: [
          {
            type: "Text",
            content: "Stay Updated",
            tailwindStyles: "text-2xl font-serif font-bold text-gray-900",
          },
          {
            type: "Text",
            content:
              "Get the latest articles delivered straight to your inbox.",
            tailwindStyles: "text-gray-600 mt-2 max-w-md",
          },
          {
            type: "Form",
            name: "Newsletter Form",
            content: "",
            tailwindStyles:
              "flex flex-col sm:flex-row items-center gap-3 mt-6 w-full max-w-md",
            settings: { action: "/api/subscribe", method: "post" },
            elements: [
              {
                type: "Input",
                name: "email",
                content: "",
                tailwindStyles:
                  "flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900",
                settings: {
                  type: "email",
                  placeholder: "Enter your email",
                  required: true,
                },
              },
              {
                type: "Button",
                content: "Subscribe",
                tailwindStyles:
                  "px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors",
                styles: {
                  default: { backgroundColor: "#111827", color: "#fff" },
                },
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "Blog Footer",
        content: "",
        tailwindStyles:
          "w-full px-6 md:px-12 py-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4",
        elements: [
          {
            type: "Text",
            content: "© 2024 The Daily Read. All rights reserved.",
            tailwindStyles: "text-sm text-gray-500",
          },
          {
            type: "Frame",
            name: "Footer Links",
            content: "",
            tailwindStyles: "flex items-center gap-6",
            elements: [
              {
                type: "Link",
                content: "Privacy",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-500 hover:text-gray-900 transition-colors",
              },
              {
                type: "Link",
                content: "Terms",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-500 hover:text-gray-900 transition-colors",
              },
              {
                type: "Link",
                content: "RSS",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-500 hover:text-gray-900 transition-colors",
              },
            ],
          },
        ],
        href: "",
        src: "",
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/* -------------------------------------------------------------------------- */
/* ----------------------------- E-Commerce Site ---------------------------- */
/* -------------------------------------------------------------------------- */

export const ecommerceSiteTemplate = {
  component: {
    type: "Section",
    id: mkId("ecommerce-site"),
    name: "E-Commerce Site Template",
    role: "main",
    ariaLabel: "E-Commerce Website Template",
    content: "",
    tailwindStyles: "w-full min-h-screen bg-white",
    elements: [
      // ==================== NAVBAR ====================
      {
        type: "Frame",
        name: "Shop Navbar",
        content: "",
        tailwindStyles:
          "w-full flex items-center justify-between px-6 md:px-12 py-4 bg-white border-b border-gray-100 sticky top-0 z-50",
        elements: [
          {
            type: "Text",
            content: "SHOPIFY",
            tailwindStyles: "text-xl font-bold tracking-widest text-gray-900",
          },
          {
            type: "Frame",
            name: "Nav Links",
            content: "",
            tailwindStyles: "hidden md:flex items-center gap-8",
            elements: [
              {
                type: "Link",
                content: "New Arrivals",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-600 hover:text-gray-900 transition-colors",
              },
              {
                type: "Link",
                content: "Women",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-600 hover:text-gray-900 transition-colors",
              },
              {
                type: "Link",
                content: "Men",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-600 hover:text-gray-900 transition-colors",
              },
              {
                type: "Link",
                content: "Sale",
                href: "#",
                tailwindStyles:
                  "text-sm text-red-600 font-medium hover:text-red-700 transition-colors",
              },
            ],
          },
          {
            type: "Frame",
            name: "Nav Actions",
            content: "",
            tailwindStyles: "flex items-center gap-4",
            elements: [
              {
                type: "Button",
                content: "🔍",
                tailwindStyles:
                  "p-2 text-gray-600 hover:text-gray-900 transition-colors",
              },
              {
                type: "Button",
                content: "♡",
                tailwindStyles:
                  "p-2 text-gray-600 hover:text-gray-900 transition-colors",
              },
              {
                type: "Button",
                content: "🛒",
                tailwindStyles:
                  "p-2 text-gray-600 hover:text-gray-900 transition-colors",
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== HERO ====================
      {
        type: "Section",
        name: "Shop Hero",
        content: "",
        role: "region",
        ariaLabel: "Hero section",
        tailwindStyles:
          "w-full px-6 md:px-12 py-16 md:py-24 bg-gradient-to-r from-amber-50 to-orange-50 flex flex-col md:flex-row items-center gap-12",
        elements: [
          {
            type: "Frame",
            name: "Hero Content",
            content: "",
            tailwindStyles: "flex-1",
            elements: [
              {
                type: "Text",
                content: "Spring Collection 2024",
                tailwindStyles:
                  "text-sm uppercase tracking-widest text-amber-700 mb-4",
              },
              {
                type: "Text",
                content: "Discover Your Perfect Style",
                tailwindStyles:
                  "text-4xl md:text-5xl font-bold text-gray-900 leading-tight",
              },
              {
                type: "Text",
                content:
                  "Explore our latest collection of handpicked items, designed to elevate your everyday look.",
                tailwindStyles: "text-lg text-gray-600 mt-4 max-w-lg",
              },
              {
                type: "Button",
                content: "Shop Now →",
                tailwindStyles:
                  "mt-8 px-8 py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors",
                styles: {
                  default: { backgroundColor: "#111827", color: "#fff" },
                },
              },
            ],
          },
          {
            type: "Image",
            content: "Hero Image",
            src: "",
            alt: "Spring Collection",
            tailwindStyles:
              "flex-1 aspect-square max-w-lg rounded-2xl object-cover",
            settings: { objectFit: "cover", loading: "eager" },
          },
        ],
        href: "",
        src: "",
      },

      // ==================== PRODUCT CAROUSEL ====================
      {
        type: "Section",
        name: "Featured Products",
        content: "",
        role: "region",
        ariaLabel: "Featured products",
        tailwindStyles: "w-full px-6 md:px-12 py-16",
        elements: [
          {
            type: "Frame",
            name: "Section Header",
            content: "",
            tailwindStyles: "flex items-center justify-between mb-8",
            elements: [
              {
                type: "Text",
                content: "Trending Now",
                tailwindStyles: "text-2xl font-bold text-gray-900",
              },
              {
                type: "Link",
                content: "View All →",
                href: "#",
                tailwindStyles:
                  "text-sm text-gray-600 hover:text-gray-900 transition-colors",
              },
            ],
          },
          {
            type: "Carousel",
            name: "Products Carousel",
            content: "",
            tailwindStyles: "w-full",
            settings: {
              loop: true,
              slidesToShow: 4,
              withNavigation: true,
              breakpoints: {
                "(max-width: 768px)": { slidesToShow: 2 },
                "(max-width: 1024px)": { slidesToShow: 3 },
              },
            },
            elements: [
              {
                type: "Frame",
                name: "Product 1",
                content: "",
                tailwindStyles: "px-2 group cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Product 1",
                    src: "",
                    alt: "Product",
                    tailwindStyles:
                      "aspect-[3/4] rounded-lg object-cover w-full mb-4 group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Text",
                    content: "Linen Blend Shirt",
                    tailwindStyles: "text-sm font-medium text-gray-900",
                  },
                  {
                    type: "Text",
                    content: "$59.00",
                    tailwindStyles: "text-sm text-gray-600 mt-1",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Product 2",
                content: "",
                tailwindStyles: "px-2 group cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Product 2",
                    src: "",
                    alt: "Product",
                    tailwindStyles:
                      "aspect-[3/4] rounded-lg object-cover w-full mb-4 group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Text",
                    content: "Wool Cardigan",
                    tailwindStyles: "text-sm font-medium text-gray-900",
                  },
                  {
                    type: "Text",
                    content: "$79.00",
                    tailwindStyles: "text-sm text-gray-600 mt-1",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Product 3",
                content: "",
                tailwindStyles: "px-2 group cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Product 3",
                    src: "",
                    alt: "Product",
                    tailwindStyles:
                      "aspect-[3/4] rounded-lg object-cover w-full mb-4 group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Text",
                    content: "Relaxed Fit Jeans",
                    tailwindStyles: "text-sm font-medium text-gray-900",
                  },
                  {
                    type: "Text",
                    content: "$89.00",
                    tailwindStyles: "text-sm text-gray-600 mt-1",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Product 4",
                content: "",
                tailwindStyles: "px-2 group cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Product 4",
                    src: "",
                    alt: "Product",
                    tailwindStyles:
                      "aspect-[3/4] rounded-lg object-cover w-full mb-4 group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Text",
                    content: "Leather Tote Bag",
                    tailwindStyles: "text-sm font-medium text-gray-900",
                  },
                  {
                    type: "Text",
                    content: "$149.00",
                    tailwindStyles: "text-sm text-gray-600 mt-1",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== CATEGORIES GRID ====================
      {
        type: "Section",
        name: "Categories",
        content: "",
        role: "region",
        ariaLabel: "Shop by category",
        tailwindStyles: "w-full px-6 md:px-12 py-16 bg-gray-50",
        elements: [
          {
            type: "Text",
            content: "Shop by Category",
            tailwindStyles: "text-2xl font-bold text-gray-900 mb-8 text-center",
          },
          {
            type: "List",
            name: "Categories Grid",
            content: "",
            tailwindStyles: "grid grid-cols-2 md:grid-cols-4 gap-6",
            elements: [
              {
                type: "Frame",
                name: "Category 1",
                content: "",
                tailwindStyles:
                  "group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Dresses",
                    src: "",
                    alt: "Dresses",
                    tailwindStyles:
                      "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Frame",
                    name: "Overlay",
                    content: "",
                    tailwindStyles:
                      "absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4",
                    elements: [
                      {
                        type: "Text",
                        content: "Dresses",
                        tailwindStyles: "text-lg font-semibold text-white",
                      },
                    ],
                  },
                ],
              },
              {
                type: "Frame",
                name: "Category 2",
                content: "",
                tailwindStyles:
                  "group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Tops",
                    src: "",
                    alt: "Tops",
                    tailwindStyles:
                      "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Frame",
                    name: "Overlay",
                    content: "",
                    tailwindStyles:
                      "absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4",
                    elements: [
                      {
                        type: "Text",
                        content: "Tops",
                        tailwindStyles: "text-lg font-semibold text-white",
                      },
                    ],
                  },
                ],
              },
              {
                type: "Frame",
                name: "Category 3",
                content: "",
                tailwindStyles:
                  "group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Bottoms",
                    src: "",
                    alt: "Bottoms",
                    tailwindStyles:
                      "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Frame",
                    name: "Overlay",
                    content: "",
                    tailwindStyles:
                      "absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4",
                    elements: [
                      {
                        type: "Text",
                        content: "Bottoms",
                        tailwindStyles: "text-lg font-semibold text-white",
                      },
                    ],
                  },
                ],
              },
              {
                type: "Frame",
                name: "Category 4",
                content: "",
                tailwindStyles:
                  "group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer",
                elements: [
                  {
                    type: "Image",
                    content: "Accessories",
                    src: "",
                    alt: "Accessories",
                    tailwindStyles:
                      "absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform",
                    settings: { objectFit: "cover", loading: "lazy" },
                  },
                  {
                    type: "Frame",
                    name: "Overlay",
                    content: "",
                    tailwindStyles:
                      "absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-end p-4",
                    elements: [
                      {
                        type: "Text",
                        content: "Accessories",
                        tailwindStyles: "text-lg font-semibold text-white",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },

      // ==================== FOOTER ====================
      {
        type: "Frame",
        name: "Shop Footer",
        content: "",
        tailwindStyles: "w-full px-6 md:px-12 py-12 bg-gray-900 text-white",
        styles: { default: { backgroundColor: "#111827" } },
        elements: [
          {
            type: "Frame",
            name: "Footer Grid",
            content: "",
            tailwindStyles: "grid grid-cols-2 md:grid-cols-4 gap-8 mb-8",
            elements: [
              {
                type: "Frame",
                name: "Brand",
                content: "",
                tailwindStyles: "col-span-2 md:col-span-1",
                elements: [
                  {
                    type: "Text",
                    content: "SHOPIFY",
                    tailwindStyles:
                      "text-xl font-bold tracking-widest text-white mb-4",
                  },
                  {
                    type: "Text",
                    content:
                      "Premium quality fashion for the modern lifestyle.",
                    tailwindStyles: "text-sm text-gray-400",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Shop Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Shop",
                    tailwindStyles: "text-sm font-semibold text-white mb-2",
                  },
                  {
                    type: "Link",
                    content: "New Arrivals",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-gray-400 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Best Sellers",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-gray-400 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Sale",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-gray-400 hover:text-white transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Help Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Help",
                    tailwindStyles: "text-sm font-semibold text-white mb-2",
                  },
                  {
                    type: "Link",
                    content: "FAQ",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-gray-400 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Shipping",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-gray-400 hover:text-white transition-colors",
                  },
                  {
                    type: "Link",
                    content: "Returns",
                    href: "#",
                    tailwindStyles:
                      "text-sm text-gray-400 hover:text-white transition-colors",
                  },
                ],
              },
              {
                type: "Frame",
                name: "Contact Column",
                content: "",
                tailwindStyles: "flex flex-col gap-3",
                elements: [
                  {
                    type: "Text",
                    content: "Contact",
                    tailwindStyles: "text-sm font-semibold text-white mb-2",
                  },
                  {
                    type: "Text",
                    content: "support@shopify.com",
                    tailwindStyles: "text-sm text-gray-400",
                  },
                  {
                    type: "Text",
                    content: "1-800-SHOPIFY",
                    tailwindStyles: "text-sm text-gray-400",
                  },
                ],
              },
            ],
          },
          {
            type: "Frame",
            name: "Footer Bottom",
            content: "",
            tailwindStyles:
              "pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4",
            elements: [
              {
                type: "Text",
                content: "© 2024 Shopify. All rights reserved.",
                tailwindStyles: "text-sm text-gray-500",
              },
              {
                type: "Frame",
                name: "Payment Methods",
                content: "",
                tailwindStyles: "flex items-center gap-4",
                elements: [
                  {
                    type: "Text",
                    content: "💳 Visa",
                    tailwindStyles: "text-sm text-gray-500",
                  },
                  {
                    type: "Text",
                    content: "💳 Mastercard",
                    tailwindStyles: "text-sm text-gray-500",
                  },
                  {
                    type: "Text",
                    content: "💳 PayPal",
                    tailwindStyles: "text-sm text-gray-500",
                  },
                ],
              },
            ],
          },
        ],
        href: "",
        src: "",
      },
    ],
    href: "",
    src: "",
  },
} as unknown as CustomComponent;

/* -------------------------------------------------------------------------- */
/* ----------------------------- Convenience Exports ------------------------ */
/* -------------------------------------------------------------------------- */

export const siteTemplates = [
  portfolioSiteTemplate,
  agencySiteTemplate,
  saasSiteTemplate,
  blogSiteTemplate,
  ecommerceSiteTemplate,
] as unknown as CustomComponent[];
