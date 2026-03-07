import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, HelpCircle, ChevronRight, ChevronDown, Mail, Phone, MessageCircle, Clock, Send, BookOpen, Sparkles } from "lucide-react";
import { I as Input, B as Button, d as Badge, T as Tabs, e as TabsList, f as TabsTrigger, g as TabsContent } from "./prisma-BUnO9f9X.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle, d as CardDescription } from "./card-D42cGFKZ.js";
import "clsx";
import "./project.service-Bci2lGYe.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "sonner";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function HelpSearch({ searchQuery, setSearchQuery }) {
  return /* @__PURE__ */ jsx(Card, { className: "bg-secondary/20 shadow-md", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" }),
    /* @__PURE__ */ jsx(
      Input,
      {
        type: "text",
        placeholder: "Tìm kiếm câu hỏi, ví dụ: 'quên mật khẩu', 'nâng cấp tài khoản'...",
        className: "h-12 bg-background pl-10 pr-4 text-base",
        value: searchQuery,
        onChange: (e) => setSearchQuery(e.target.value)
      }
    )
  ] }) }) });
}
function FAQSection({ faqs: faqs2, searchQuery, expandedFAQ, setExpandedFAQ }) {
  const filteredFAQs = faqs2.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) => searchQuery === "" || item.question.toLowerCase().includes(searchQuery.toLowerCase()) || item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter((category) => category.items.length > 0);
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  if (filteredFAQs.length === 0) {
    return /* @__PURE__ */ jsx(Card, { className: "w-full max-w-4xl mx-auto", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsx(HelpCircle, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Not found your answer? Please contact our support team for further assistance." })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-6 w-full max-w-4xl mx-auto", children: filteredFAQs.map((category, categoryIndex) => /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, amount: 0.2 },
      variants: staggerContainer,
      children: [
        /* @__PURE__ */ jsxs(
          motion.h3,
          {
            className: "text-xl font-semibold mb-4 flex items-center gap-2 text-left",
            variants: fadeInUp,
            children: [
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-primary" }),
              category.category
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: category.items.map((item, itemIndex) => {
          const globalIndex = categoryIndex * 100 + itemIndex;
          const isExpanded = expandedFAQ === globalIndex;
          return /* @__PURE__ */ jsx(motion.div, { variants: fadeInUp, children: /* @__PURE__ */ jsxs(
            Card,
            {
              className: "cursor-pointer hover:shadow-md transition-shadow",
              onClick: () => setExpandedFAQ(isExpanded ? null : globalIndex),
              children: [
                /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-semibold flex items-start justify-between gap-4", children: [
                  /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.question }),
                  isExpanded ? /* @__PURE__ */ jsx(ChevronDown, { className: "w-5 h-5 text-primary flex-shrink-0 mt-0.5" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" })
                ] }) }),
                isExpanded && /* @__PURE__ */ jsx(CardContent, { className: "pt-0", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed whitespace-pre-line", children: item.answer }) })
              ]
            }
          ) }, itemIndex);
        }) })
      ]
    },
    categoryIndex
  )) });
}
const supportChannels = [
  {
    icon: Mail,
    title: "Email",
    description: "Send us an email",
    contact: "support@webbuilder.vn",
    link: "mailto:support@webbuilder.vn",
    responseTime: "Reply within 24h"
  },
  {
    icon: Phone,
    title: "Hotline",
    description: "Call us directly",
    contact: "1900 2468",
    link: "tel:19002468",
    responseTime: "Mon-Fri: 8am-6pm"
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat directly with our consultant",
    contact: "Available 24/7",
    link: "#",
    responseTime: "Instant response"
  }
];
function ContactSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "mb-6 text-center",
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true },
        variants: fadeInUp,
        transition: { duration: 0.5 },
        children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-2 text-2xl font-bold", children: "Contact Support" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Choose the contact method that suits you" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "mb-8 grid w-full max-w-6xl gap-6 md:grid-cols-3",
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.2 },
        variants: staggerContainer,
        children: supportChannels.map((channel, index) => /* @__PURE__ */ jsx(motion.div, { variants: fadeInUp, children: /* @__PURE__ */ jsx(
          Card,
          {
            className: "group h-full cursor-pointer bg-secondary/20 transition-all duration-300 hover:border-primary hover:shadow-lg",
            onClick: () => window.location.href = channel.link,
            children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20", children: /* @__PURE__ */ jsx(channel.icon, { className: "h-6 w-6 text-primary" }) }),
              /* @__PURE__ */ jsx("h3", { className: "mb-2 text-xl font-semibold", children: channel.title }),
              /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm text-muted-foreground", children: channel.description }),
              /* @__PURE__ */ jsx("p", { className: "mb-2 font-medium text-primary", children: channel.contact }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: channel.responseTime })
            ] }) })
          }
        ) }, index))
      }
    ),
    /* @__PURE__ */ jsx(WorkingHours, {}),
    /* @__PURE__ */ jsx(QuickContactForm, {})
  ] });
}
function WorkingHours() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, amount: 0.3 },
      variants: fadeInUp,
      transition: { duration: 0.5 },
      className: "w-full max-w-2xl",
      children: /* @__PURE__ */ jsxs(Card, { className: "bg-secondary/20 shadow-md", children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10", children: /* @__PURE__ */ jsx(Clock, { className: "h-6 w-6 text-primary" }) }),
          /* @__PURE__ */ jsx(CardTitle, { children: "Working Hours" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Customer support operating hours" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Monday - Friday:" }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "8:00 - 18:00" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Saturday:" }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "8:00 - 12:00" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center py-2 border-b", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Sunday & Holidays:" }),
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Closed" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-4 bg-primary/5 rounded-lg p-4 mt-4", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-center", children: [
            /* @__PURE__ */ jsx("strong", { className: "text-primary", children: "Note:" }),
            " Live Chat operates 24/7. Emails are answered within 24 business hours. Hotline only operates during business hours."
          ] }) })
        ] }) })
      ] })
    }
  );
}
function QuickContactForm() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: "hidden",
      whileInView: "visible",
      viewport: { once: true, amount: 0.3 },
      variants: fadeInUp,
      transition: { duration: 0.5, delay: 0.1 },
      className: "w-full max-w-2xl",
      children: /* @__PURE__ */ jsxs(Card, { className: "bg-secondary/20 shadow-md", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Send Quick Message" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Fill in the information below and we will contact you as soon as possible" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsx(Input, { placeholder: "Full name", className: "bg-background" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "email",
                placeholder: "Email",
                className: "bg-background"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Input, { placeholder: "Subject", className: "bg-background" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              className: "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
              placeholder: "Message content..."
            }
          ),
          /* @__PURE__ */ jsxs(Button, { className: "w-full", size: "lg", children: [
            /* @__PURE__ */ jsx(Send, { className: "mr-2 h-4 w-4" }),
            "Send Message"
          ] })
        ] }) })
      ] })
    }
  );
}
const guides = [
  {
    title: "Getting Started Guide",
    description: "Learn basic usage from A-Z",
    link: "/docs/getting-started",
    duration: "5 min read"
  },
  {
    title: "Video Tutorials",
    description: "Watch detailed tutorial videos",
    link: "/docs/videos",
    duration: "15+ videos"
  },
  {
    title: "Templates & Examples",
    description: "Explore ready-made template library",
    link: "/templates",
    duration: "100+ templates"
  },
  {
    title: "API Documentation",
    description: "For advanced developers",
    link: "/docs/api",
    duration: "Full documentation"
  },
  {
    title: "Blog & Tutorials",
    description: "Tips, tricks and latest updates",
    link: "/blog",
    duration: "Updated weekly"
  },
  {
    title: "Community",
    description: "Join the discussion forum",
    link: "/community",
    duration: "5000+ members"
  }
];
function GuidesSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "mb-6 text-center",
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true },
        variants: fadeInUp,
        transition: { duration: 0.5 },
        children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-2 text-2xl font-bold", children: "User Guides" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Detailed documentation and guides for effective use" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        className: "grid w-full max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3",
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.2 },
        variants: staggerContainer,
        children: guides.map((guide, index) => /* @__PURE__ */ jsx(motion.div, { variants: fadeInUp, children: /* @__PURE__ */ jsx(
          Card,
          {
            className: "group h-full cursor-pointer bg-secondary/20 transition-all duration-300 hover:border-primary hover:shadow-lg",
            onClick: () => window.location.href = guide.link,
            children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-start justify-between", children: [
                /* @__PURE__ */ jsx(BookOpen, { className: "h-6 w-6 text-primary" }),
                /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" })
              ] }),
              /* @__PURE__ */ jsx("h3", { className: "mb-2 text-lg font-semibold", children: guide.title }),
              /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm text-muted-foreground", children: guide.description }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-primary", children: guide.duration })
            ] })
          }
        ) }, index))
      }
    ),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.3 },
        variants: fadeInUp,
        transition: { duration: 0.5 },
        className: "w-full max-w-4xl",
        children: /* @__PURE__ */ jsxs(Card, { className: "bg-secondary/20 shadow-md", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Additional Resources" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Other learning and support resources" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "grid gap-4 md:grid-cols-2",
              variants: staggerContainer,
              initial: "hidden",
              whileInView: "visible",
              viewport: { once: true },
              children: [
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    className: "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                    variants: fadeInUp,
                    children: [
                      /* @__PURE__ */ jsx(BookOpen, { className: "mt-0.5 h-5 w-5 text-primary" }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("h4", { className: "mb-1 font-semibold", children: "Changelog" }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "View new features and updates" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    className: "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                    variants: fadeInUp,
                    children: [
                      /* @__PURE__ */ jsx(MessageCircle, { className: "mt-0.5 h-5 w-5 text-primary" }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("h4", { className: "mb-1 font-semibold", children: "Community Forum" }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Connect with other users" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    className: "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                    variants: fadeInUp,
                    children: [
                      /* @__PURE__ */ jsx(Mail, { className: "mt-0.5 h-5 w-5 text-primary" }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("h4", { className: "mb-1 font-semibold", children: "Newsletter" }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Subscribe to weekly newsletter" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    className: "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50",
                    variants: fadeInUp,
                    children: [
                      /* @__PURE__ */ jsx(HelpCircle, { className: "mt-0.5 h-5 w-5 text-primary" }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("h4", { className: "mb-1 font-semibold", children: "Status Page" }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Check system status" })
                      ] })
                    ]
                  }
                )
              ]
            }
          ) })
        ] })
      }
    )
  ] });
}
const faqs = [
  {
    category: "Account",
    items: [
      {
        question: "How to create a new account?",
        answer: "You can create an account by clicking the 'Sign Up' button in the top right corner. Fill in your email and password, then verify your email to complete registration. This process only takes a few minutes."
      },
      {
        question: "I forgot my password, what should I do?",
        answer: "On the login page, click 'Forgot Password?'. Enter your registered email, and we will send a password recovery link to your email within 5 minutes. Check your spam folder if you don't see the email."
      },
      {
        question: "How to change personal information?",
        answer: "Go to 'Settings' > 'Personal Profile', where you can update your name, profile picture, phone number, and other contact information. Remember to click 'Save Changes' after editing."
      }
    ]
  },
  {
    category: "Payment & Service Plans",
    items: [
      {
        question: "What are the differences between service plans?",
        answer: "We offer 3 plans:\n• Free: Basic features, 3 websites, 1GB storage\n• Pro (299,000đ/month): Unlimited pages, 10GB storage, custom domain\n• Enterprise (999,000đ/month): Unlimited, 24/7 priority support, custom API"
      },
      {
        question: "How to upgrade my account?",
        answer: "Go to 'Settings' > 'Service Plan', select the appropriate plan and click 'Upgrade'. We support payment via ATM card, Visa/MasterCard, MoMo, and bank transfer. Your account is upgraded immediately after successful payment."
      },
      {
        question: "Can I cancel my subscription at any time?",
        answer: "Yes, you can cancel your subscription at any time in 'Settings' > 'Service Plan' > 'Cancel Subscription'. The service plan will remain active until the end of the current billing cycle. No cancellation fees."
      },
      {
        question: "Is there a refund policy?",
        answer: "Yes, we have a 100% refund policy within the first 30 days if you are not satisfied with the service. Contact our support team for quick processing."
      }
    ]
  },
  {
    category: "Security & Data",
    items: [
      {
        question: "Is my data secure?",
        answer: "Data security is our top priority. We use:\n• 256-bit SSL/TLS encryption\n• GDPR compliance and international security standards\n• Daily automatic backups\n• Two-factor authentication (2FA)\n• Servers located in Vietnam and Singapore"
      },
      {
        question: "Can I export my data?",
        answer: "Yes, you can export all your data in JSON, CSV, or full backup format in 'Settings' > 'Data & Privacy' > 'Export Data'. The file will be sent to your email."
      },
      {
        question: "How to enable two-factor authentication?",
        answer: "Go to 'Settings' > 'Security' > 'Two-Factor Authentication'. Scan the QR code with Google Authenticator or Authy app, then enter the verification code. We recommend enabling this feature for enhanced security."
      }
    ]
  },
  {
    category: "Features & Usage",
    items: [
      {
        question: "How to create a new website?",
        answer: "In the Dashboard, click the 'Create New Page' button in the top corner. Choose an available template or start from a blank page. Use the drag-and-drop editor to customize as desired, then click 'Publish'."
      },
      {
        question: "Can I use my own domain?",
        answer: "Yes, with Pro plan and above, you can connect your own domain. Go to 'Website Settings' > 'Domain', enter your domain name and follow the DNS configuration instructions. This process usually takes 24-48 hours to complete."
      },
      {
        question: "How to optimize SEO for my website?",
        answer: "Go to 'Page Settings' > 'SEO', where you can customize:\n• Meta title and description\n• Keywords\n• Open Graph tags for social media\n• Automatic sitemap\n• Pre-optimized page speed"
      },
      {
        question: "Is the website mobile-friendly?",
        answer: "Yes, all websites created on our platform are automatically responsive, displaying well on all devices from desktop, tablet to smartphone. You can preview on multiple screen sizes."
      }
    ]
  }
];
function HelpAndSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full overflow-hidden px-4 py-24 sm:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 -z-10 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -top-[10%] left-[50%] h-[40%] w-[60%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl flex-col items-center justify-center gap-8", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "flex flex-col items-center space-y-2",
          initial: "hidden",
          animate: "visible",
          variants: fadeInUp,
          transition: { duration: 0.6 },
          children: [
            /* @__PURE__ */ jsxs(
              Badge,
              {
                variant: "outline",
                className: "mb-4 rounded-full border-primary/20 bg-primary/5 px-4 py-1 text-sm font-medium",
                children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "mr-1 h-3.5 w-3.5 animate-pulse text-primary" }),
                  "Help & Support"
                ]
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "bg-gradient-to-b from-foreground to-foreground/30 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl", children: "Help & Support Center" }),
            /* @__PURE__ */ jsx("p", { className: "max-w-2xl pt-2 text-lg text-muted-foreground", children: "We are always ready to help you. Find quick answers to your questions or contact our professional support team directly." })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.3 },
          variants: fadeInUp,
          transition: { duration: 0.5 },
          className: "w-full max-w-2xl",
          children: /* @__PURE__ */ jsx(
            HelpSearch,
            {
              searchQuery,
              setSearchQuery
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.3 },
          variants: fadeInUp,
          transition: { duration: 0.5, delay: 0.1 },
          className: "w-full",
          children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "faq", className: "w-full", children: [
            /* @__PURE__ */ jsxs(TabsList, { className: "mx-auto grid w-full max-w-md grid-cols-3 bg-muted/30", children: [
              /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  value: "faq",
                  className: "rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  children: "FAQ"
                }
              ),
              /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  value: "contact",
                  className: "rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  children: "Contact"
                }
              ),
              /* @__PURE__ */ jsx(
                TabsTrigger,
                {
                  value: "guides",
                  className: "rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm",
                  children: "Guides"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              TabsContent,
              {
                value: "faq",
                className: "mt-8 flex w-full flex-col items-center space-y-6",
                children: /* @__PURE__ */ jsx(
                  FAQSection,
                  {
                    faqs,
                    searchQuery,
                    expandedFAQ,
                    setExpandedFAQ
                  }
                )
              }
            ),
            /* @__PURE__ */ jsx(
              TabsContent,
              {
                value: "contact",
                className: "mt-8 flex w-full flex-col items-center space-y-6",
                children: /* @__PURE__ */ jsx(ContactSection, {})
              }
            ),
            /* @__PURE__ */ jsx(
              TabsContent,
              {
                value: "guides",
                className: "mt-8 flex w-full flex-col items-center space-y-6",
                children: /* @__PURE__ */ jsx(GuidesSection, {})
              }
            )
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.3 },
          variants: fadeInUp,
          transition: { duration: 0.6 },
          className: "w-full max-w-4xl",
          children: /* @__PURE__ */ jsx(Card, { className: "border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-12 text-center", children: [
            /* @__PURE__ */ jsx(HelpCircle, { className: "mx-auto mb-4 h-12 w-12 text-primary" }),
            /* @__PURE__ */ jsx("h3", { className: "mb-3 text-2xl font-bold", children: "Still Haven't Found an Answer?" }),
            /* @__PURE__ */ jsx("p", { className: "mx-auto mb-6 max-w-md text-muted-foreground", children: "Our support team is always ready to help you with any questions" }),
            /* @__PURE__ */ jsxs(Button, { size: "lg", className: "gap-2", children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }),
              "Contact Us"
            ] })
          ] }) })
        }
      )
    ] })
  ] });
}
const SplitComponent = HelpAndSupport;
export {
  SplitComponent as component
};
