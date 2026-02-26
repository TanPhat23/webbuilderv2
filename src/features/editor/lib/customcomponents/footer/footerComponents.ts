import { CustomComponent } from "../customComponents";
import { v4 as uuidv4 } from "uuid";

export const footerComponent: CustomComponent = {
  component: {
    type: "Frame",
    name: "Footer",
    content: "",
    styles: {
      default: {
        position: "relative",
        width: "100%",
        marginTop: "auto",
        height: "auto",
        backgroundColor: "#f8f9fa",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "40px",
      },
    },
    tailwindStyles:
      "w-full mt-auto bg-[#f8f9fa] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 py-6 px-4 sm:py-8 sm:px-6 md:py-10 md:px-8",
    elements: [
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start gap-4",
        elements: [
          {
            type: "Image",
            content: "Logo",
            href: "",
            src: "",
            styles: { default: { width: "80px", height: "80px" } },
            tailwindStyles: "w-20 h-20",
          },
          {
            type: "Text",
            content:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            href: "",
            src: "",
            styles: { default: { color: "#6c757d", fontSize: "14px" } },
            tailwindStyles: "text-gray-600 text-sm",
          },
        ],
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "Services",
            href: "",
            src: "",
            styles: { default: { color: "#ff6f61", fontWeight: "bold" } },
            tailwindStyles: "text-[#ff6f61] font-bold",
          },
          {
            type: "Link",
            content: "Email Marketing",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "Campaigns",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "Branding",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "Offline",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
        ],
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "About",
            href: "",
            src: "",
            styles: { default: { color: "#ff6f61", fontWeight: "bold" } },
            tailwindStyles: "text-[#ff6f61] font-bold",
          },
          {
            type: "Link",
            content: "Our Story",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "Benefits",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "Team",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "Careers",
            href: "/",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
        ],
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "Follow Us",
            href: "",
            src: "",
            styles: { default: { color: "#ff6f61", fontWeight: "bold" } },
            tailwindStyles: "text-[#ff6f61] font-bold",
          },
          {
            type: "Link",
            content: "Facebook",
            href: "https://facebook.com",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "Twitter",
            href: "https://twitter.com",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "Instagram",
            href: "https://instagram.com",
            src: "",
            styles: { default: { color: "#333" } },
            tailwindStyles: "text-[#333] hover:underline",
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
};

export const footerComponent2: CustomComponent = {
  component: {
    type: "Frame",
    name: "Footer2",
    content: "",
    styles: {
      default: {
        position: "relative",
        width: "100%",
        marginTop: "auto",
        height: "auto",
        backgroundColor: "#f8f9fa",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "20px",
      },
    },
    tailwindStyles:
      "w-full mt-auto bg-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 py-5 px-4 sm:px-6",
    elements: [
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "COMPANY NAME",
            styles: {
              default: {
                color: "#000",
                fontWeight: "bold",
              },
            },
            tailwindStyles: "text-black font-bold",
          },
          {
            type: "Text",
            content:
              "Here you can use rows and columns to organize your footer content. Lorem ipsum dolor sit amet, consectetur adipisicing elit.",

            href: "",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 text-sm",
          },
        ],
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "PRODUCTS",
            styles: {
              default: {
                color: "#000",
                fontWeight: "bold",
              },
            },
            tailwindStyles: "text-black font-bold",
          },
          {
            type: "Link",
            content: "MDBootstrap",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 hover:underline",
          },
          {
            type: "Link",
            content: "MDWordPress",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 hover:underline",
          },
          {
            type: "Link",
            content: "BrandFlow",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 hover:underline",
          },
          {
            type: "Link",
            content: "Bootstrap Angular",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 hover:underline",
          },
        ],
      },
      {
        type: "Frame",
        content: "",
        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "USEFUL LINKS",
            href: "",
            src: "",
            styles: {
              default: {
                color: "#000",
                fontWeight: "bold",
              },
            },
            tailwindStyles: "text-black font-bold",
          },
          {
            type: "Link",
            content: "Your Account",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 hover:underline",
          },
          {
            type: "Link",
            content: "Become an Affiliate",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 hover:underline",
          },
          {
            type: "Link",
            content: "Shipping Rates",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 hover:underline",
          },
          {
            type: "Link",
            content: "Help",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#6c757d",
              },
            },
            tailwindStyles: "text-gray-600 hover:underline",
          },
        ],
      },
      {
        type: "Frame",
        content: "",

        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start gap-2",
        elements: [
          {
            type: "Text",
            content: "USEFUL LINKS",
            styles: {
              default: {
                color: "#000",
                fontWeight: "bold",
              },
            },
            tailwindStyles: "text-black font-bold",
          },
          {
            type: "Frame",
            content: "",
            href: "",
            src: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              },
            },
            tailwindStyles: "flex flex-row items-center gap-2",

            elements: [
              {
                type: "Image",
                content: "",

                href: "",
                src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                styles: {
                  default: {
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  },
                },
                tailwindStyles: "w-6 h-6 object-contain",
              },
              {
                type: "Text",
                content: "New York, NY 10012, US",

                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#6c757d",
                  },
                },
                tailwindStyles: "text-gray-600",
              },
            ],
          },
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              },
            },
            tailwindStyles: "flex flex-row items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "",
                href: "",
                src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                styles: {
                  default: {
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  },
                },
                tailwindStyles: "w-6 h-6 object-contain",
              },
              {
                type: "Text",
                content: "New York, NY 10012, US",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#6c757d",
                  },
                },
                tailwindStyles: "text-gray-600",
              },
            ],
          },
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              },
            },
            tailwindStyles: "flex flex-row items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "",
                href: "",
                src: "https://cdn-icons-png.flaticon.com/512/732/732200.png",
                styles: {
                  default: {
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  },
                },
                tailwindStyles: "w-6 h-6 object-contain",
              },
              {
                type: "Text",
                content: "info@example.com",
                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#6c757d",
                  },
                },
                tailwindStyles: "text-gray-600",
              },
            ],
          },
          {
            type: "Frame",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
              },
            },
            tailwindStyles: "flex flex-row items-center gap-2",
            elements: [
              {
                type: "Image",
                content: "",
                href: "",
                src: "https://cdn-icons-png.flaticon.com/512/724/724664.png",
                styles: {
                  default: {
                    width: "24px",
                    height: "24px",
                    objectFit: "contain",
                  },
                },
                tailwindStyles: "w-6 h-6 object-contain",
              },
              {
                type: "Text",
                content: "+ 01 234 567 89",

                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#6c757d",
                  },
                },
                tailwindStyles: "text-gray-600",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const footerComponent3: CustomComponent = {
  component: {
    type: "Frame",
    name: "Footer3",
    content: "",

    styles: {
      default: {
        position: "relative",
        width: "100%",
        marginTop: "auto",
        height: "auto",
        backgroundColor: "#1a202c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 0",
      },
    },
    tailwindStyles:
      "w-full mt-auto bg-[#1a202c] flex flex-col items-center justify-center py-5 gap-5",
    elements: [
      {
        type: "Frame",
        content: "",

        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            maxWidth: "1200px",
          },
        },
        tailwindStyles:
          "flex flex-row justify-around w-full max-w-[1200px] gap-10",

        elements: [
          {
            type: "Frame",
            content: "",

            href: "",
            src: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              },
            },
            tailwindStyles: "flex flex-col items-start gap-2",

            elements: [
              {
                type: "Text",
                content: "RESOURCES",

                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#ffffff",
                    fontWeight: "bold",
                  },
                },
                tailwindStyles: "text-white font-bold",
              },
              {
                type: "Link",
                content: "Flowbite",

                href: "/",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0",
                  },
                },
                tailwindStyles: "text-gray-400 hover:text-white",
              },
              {
                type: "Link",
                content: "Tailwind CSS",

                href: "/",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0",
                  },
                },
                tailwindStyles: "text-gray-400 hover:text-white",
              },
            ],
          },
          {
            type: "Frame",
            content: "",

            href: "",
            src: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              },
            },
            tailwindStyles: "flex flex-col items-start gap-2",

            elements: [
              {
                type: "Text",
                content: "FOLLOW US",

                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#ffffff",
                    fontWeight: "bold",
                  },
                },
                tailwindStyles: "text-white font-bold",
              },
              {
                type: "Link",
                content: "Github",

                href: "https://github.com",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0",
                  },
                },
                tailwindStyles: "text-gray-400 hover:text-white",
              },
              {
                type: "Link",
                content: "Discord",

                href: "https://discord.com",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0",
                  },
                },
                tailwindStyles: "text-gray-400 hover:text-white",
              },
            ],
          },
          {
            type: "Frame",
            content: "",

            href: "",
            src: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              },
            },
            tailwindStyles: "flex flex-col items-start gap-2",

            elements: [
              {
                type: "Text",
                content: "LEGAL",

                href: "",
                src: "",
                styles: {
                  default: {
                    color: "#ffffff",
                    fontWeight: "bold",
                  },
                },
                tailwindStyles: "text-white font-bold",
              },
              {
                type: "Link",
                content: "Privacy Policy",

                href: "/privacy-policy",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0",
                  },
                },
                tailwindStyles: "text-gray-400 hover:text-white",
              },
              {
                type: "Link",
                content: "Terms & Conditions",

                href: "/terms",
                src: "",
                styles: {
                  default: {
                    color: "#a0aec0",
                  },
                },
                tailwindStyles: "text-gray-400 hover:text-white",
              },
            ],
          },
        ],
      },
      {
        type: "Text",
        content: "© 2023 Flowbite™. All Rights Reserved.",

        href: "",
        src: "",
        styles: {
          default: {
            color: "#ffffff",
            fontSize: "14px",
            textAlign: "center",
          },
        },
        tailwindStyles: "text-white text-sm text-center mt-5",
      },
      {
        type: "Frame",
        content: "",

        href: "",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "15px",
          },
        },
        tailwindStyles: "flex flex-row justify-center gap-4 mt-3",

        elements: [
          {
            type: "Image",
            content: "",

            href: "https://facebook.com",
            src: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
            styles: {
              default: {
                width: "24px",
                height: "24px",
              },
            },
            tailwindStyles: "w-6 h-6",
          },
          {
            type: "Image",
            content: "",

            href: "https://discord.com",
            src: "https://cdn-icons-png.flaticon.com/512/2111/2111370.png",
            styles: {
              default: {
                width: "24px",
                height: "24px",
              },
            },
            tailwindStyles: "w-6 h-6",
          },
          {
            type: "Image",
            content: "",

            href: "https://twitter.com",
            src: "https://cdn-icons-png.flaticon.com/512/733/733579.png",
            styles: {
              default: {
                width: "24px",
                height: "24px",
              },
            },
            tailwindStyles: "w-6 h-6",
          },
          {
            type: "Image",
            content: "",

            href: "https://github.com",
            src: "https://cdn-icons-png.flaticon.com/512/733/733553.png",
            styles: {
              default: {
                width: "24px",
                height: "24px",
              },
            },
            tailwindStyles: "w-6 h-6",
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
};

export const footerComponent4: CustomComponent = {
  component: {
    type: "Frame",
    name: "Footer4",
    content: "",
    styles: {
      default: {
        position: "relative",
        width: "100%",
        marginTop: "auto",
        height: "auto",
        backgroundColor: "#fbeee6",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "20px",
      },
    },
    tailwindStyles:
      "w-full mt-auto bg-[#fbeee6] grid grid-cols-1 md:grid-cols-4 gap-5 py-5 px-4",
    elements: [
      {
        type: "Frame",
        content: "",

        href: "/",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start text-left gap-2",

        elements: [
          {
            type: "Text",
            content: "shopping online",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#8b4513",
                fontWeight: "bold",
                marginBottom: "10px",
              },
            },
            tailwindStyles: "text-[#8b4513] font-bold mb-2",
          },
          {
            type: "Link",
            content: "frequently asked questions",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "delivery",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "pricing",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "where we deliver?",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
        ],
      },
      {
        type: "Frame",
        content: "",

        href: "/",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start text-left gap-2",

        elements: [
          {
            type: "Text",
            content: "gift cards",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#8b4513",
                fontWeight: "bold",
                marginBottom: "10px",
              },
            },
            tailwindStyles: "text-[#8b4513] font-bold mb-2",
          },
          {
            type: "Link",
            content: "frequently asked questions",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "delivery and payment",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "activate the card",

            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
          {
            type: "Link",
            content: "rules",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
        ],
      },
      {
        type: "Frame",
        content: "",
        href: "/",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start text-left gap-2",
        elements: [
          {
            type: "Text",
            content: "company",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#8b4513",
                fontWeight: "bold",
                marginBottom: "10px",
              },
            },
            tailwindStyles: "text-[#8b4513] font-bold mb-2",
          },
          {
            type: "Link",
            content: "buy a gift card",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px",
              },
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline",
          },
          {
            type: "Link",
            content: "history",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px",
              },
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline",
          },
          {
            type: "Link",
            content: "return",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px",
              },
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline",
          },
          {
            type: "Link",
            content: "contact",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
        ],
      },
      {
        type: "Frame",
        content: "",
        href: "/",
        src: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          },
        },
        tailwindStyles: "flex flex-col items-start text-left gap-2",
        elements: [
          {
            type: "Text",
            content: "diamond club",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#8b4513",
                fontWeight: "bold",
                marginBottom: "10px",
              },
            },
            tailwindStyles: "text-[#8b4513] font-bold mb-2",
          },
          {
            type: "Link",
            content: "registration",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px",
              },
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline",
          },
          {
            type: "Link",
            content: "application",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px",
              },
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline",
          },
          {
            type: "Link",
            content: "about program",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
                marginBottom: "5px",
              },
            },
            tailwindStyles: "text-[#333] mb-1 hover:underline",
          },
          {
            type: "Link",
            content: "rules",
            href: "/",
            src: "",
            styles: {
              default: {
                color: "#333",
              },
            },
            tailwindStyles: "text-[#333] hover:underline",
          },
        ],
      },
    ],
  },
};
