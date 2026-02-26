import { CustomComponent } from "../customComponents";

export const sidebarRightComponent: CustomComponent = {
  component: {
    type: "Frame",
    name: "SidebarRight",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "300px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "20px 15px",
        boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
        position: "fixed",
        right: "0",
        top: "0",
      },
    },
    tailwindStyles:
      "flex flex-col items-start w-72 h-full p-5 bg-white shadow-md fixed right-0 top-0 md:w-56 sm:w-40 transition-all hidden sm:block",
    elements: [
      {
        type: "Text",
        content: "Notifications",
        styles: {
          default: {
            color: "#333",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "20px",
          },
        },
        tailwindStyles:
          "text-gray-800 text-xl font-bold mb-5 text-center md:text-lg sm:text-sm",
      },
      {
        type: "Frame",
        name: "NotificationItem",
        content: "",
        styles: {
          default: {
            width: "100%",
            padding: "12px",
            borderBottom: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
          },
        },
        tailwindStyles:
          "w-full p-3 border-b border-gray-100 flex flex-col text-sm md:text-xs sm:text-[10px]",
        elements: [
          {
            type: "Text",
            content: "New message received",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                fontWeight: "500",
              },
            },
            tailwindStyles: "text-gray-800 text-md font-medium",
          },
        ],
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px",
            backgroundColor: "#F9FAFB",
            gap: "12px",
          },
        },
        tailwindStyles:
          "flex items-center p-3 mt-auto rounded-lg bg-gray-50 gap-3 hover:bg-gray-100 w-full",
        elements: [
          {
            type: "Text",
            content: "John Doe",
            styles: {
              default: {
                color: "#111827",
                fontSize: "14px",
                fontWeight: "500",
              },
            },
            tailwindStyles: "text-gray-900 text-sm font-medium sm:hidden",
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
};

export const sidebarRightComponent2: CustomComponent = {
  component: {
    type: "Frame",
    name: "SidebarRight2",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "320px",
        backgroundColor: "#222831",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "25px 15px",
        position: "fixed",
        right: "0",
        top: "0",
      },
    },
    tailwindStyles:
      "flex flex-col items-start w-80 h-full p-6 bg-gray-900 fixed right-0 top-0 md:w-60 sm:w-40 transition-all hidden sm:block",
    elements: [
      {
        type: "Text",
        content: "ACTIVITY FEED",
        styles: {
          default: {
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "30px",
            letterSpacing: "1px",
          },
        },
        tailwindStyles:
          "text-white text-lg font-bold mb-8 tracking-wide text-center md:text-base sm:text-sm",
      },
      {
        type: "Frame",
        name: "ActivityItem",
        content: "",
        styles: {
          default: {
            width: "100%",
            padding: "15px",
            backgroundColor: "#393e46",
            borderRadius: "8px",
            marginBottom: "15px",
            display: "flex",
            flexDirection: "column",
          },
        },
        tailwindStyles:
          "w-full p-4 bg-gray-800 rounded-lg mb-4 flex flex-col text-sm md:text-xs sm:text-[10px]",
        elements: [
          {
            type: "Text",
            content: "",
            styles: {
              default: {
                color: "white",
                fontSize: "16px",
                fontWeight: "500",
              },
            },
            tailwindStyles: "text-white text-md font-medium",
          },
          {
            type: "Text",
            content: "5 minutes ago",
            styles: {
              default: {
                color: "#aaa",
                fontSize: "14px",
                marginTop: "5px",
              },
            },
            tailwindStyles: "text-gray-400 text-sm mt-1",
          },
        ],
        href: "",
        src: "",
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px",
            backgroundColor: "#393e46",
            gap: "12px",
          },
        },
        tailwindStyles:
          "flex items-center p-3 mt-auto rounded-lg bg-gray-800 gap-3 hover:bg-gray-700 w-full",
        elements: [
          {
            type: "Text",
            content: "John Doe",
            styles: {
              default: {
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
              },
            },
            tailwindStyles: "text-white text-sm font-medium sm:hidden",
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
};

export const sidebarRightComponent3: CustomComponent = {
  component: {
    type: "Frame",
    name: "SidebarRight3",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "280px",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "20px 15px",
        borderLeft: "1px solid #e0e0e0",
        position: "fixed",
        right: "0",
        top: "0",
      },
    },
    tailwindStyles:
      "flex flex-col items-start w-72 h-full p-5 bg-gray-100 border-l border-gray-200 fixed right-0 top-0 md:w-56 sm:w-40 transition-all hidden sm:block",
    elements: [
      {
        type: "Text",
        content: "Recent Updates",
        styles: {
          default: {
            color: "#343a40",
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "20px",
          },
        },
        tailwindStyles:
          "text-gray-800 text-lg font-semibold mb-5 text-center md:text-base sm:text-sm",
      },
      {
        type: "Frame",
        name: "UpdateItem",
        content: "",
        styles: {
          default: {
            width: "100%",
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "6px",
            marginBottom: "12px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          },
        },
        tailwindStyles:
          "w-full p-3 bg-white rounded-md mb-3 flex flex-col shadow-xs text-sm md:text-xs sm:text-[10px]",
        elements: [
          {
            type: "Text",
            content: "Product Update v2.1",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                fontWeight: "500",
              },
            },
            tailwindStyles: "text-gray-800 text-md font-medium",
          },
          {
            type: "Text",
            content: "",
            styles: {
              default: {
                color: "#6c757d",
                fontSize: "14px",
                marginTop: "5px",
              },
            },
            tailwindStyles: "text-gray-600 text-sm mt-1",
          },
        ],
        href: "",
        src: "",
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px",
            backgroundColor: "#e9ecef",
            gap: "12px",
          },
        },
        tailwindStyles:
          "flex items-center p-3 mt-auto rounded-lg bg-gray-200 gap-3 hover:bg-gray-300 w-full",
        elements: [
          {
            type: "Text",
            content: "Jane Doe",
            styles: {
              default: {
                color: "#495057",
                fontSize: "14px",
                fontWeight: "500",
              },
            },
            tailwindStyles: "text-gray-700 text-sm font-medium sm:hidden",
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
};

export const sidebarRightComponent4: CustomComponent = {
  component: {
    type: "Frame",
    name: "SidebarRight4",
    content: "",
    styles: {
      default: {
        height: "100%",
        width: "330px",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "25px 20px",
        boxShadow: "-2px 0 10px rgba(0,0,0,0.05)",
        position: "fixed",
        right: "0",
        top: "0",
      },
    },
    tailwindStyles:
      "flex flex-col items-start w-80 h-full p-6 bg-white shadow-md fixed right-0 top-0 md:w-64 sm:w-48 transition-all hidden sm:block",
    elements: [
      {
        type: "Text",
        content: "People Online",
        styles: {
          default: {
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "20px",
          },
        },
        tailwindStyles:
          "text-gray-800 text-lg font-bold mb-5 text-center md:text-left sm:text-sm",
      },
      {
        type: "Frame",
        name: "UserItem",
        content: "",
        styles: {
          default: {
            width: "100%",
            padding: "10px 0",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          },
        },
        tailwindStyles:
          "w-full py-2 border-b border-gray-100 flex flex-row items-center text-sm md:text-base",
        elements: [
          {
            type: "Text",
            content: "•",
            styles: {
              default: {
                color: "#4CAF50",
                fontSize: "24px",
                marginRight: "10px",
              },
            },
            tailwindStyles: "text-green-500 text-2xl mr-2",
          },
          {
            type: "Text",
            content: "",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
              },
            },
            tailwindStyles: "text-gray-800 text-md",
          },
        ],
        href: "",
        src: "",
      },
      {
        type: "Frame",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginTop: "auto",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
            gap: "12px",
          },
        },
        tailwindStyles:
          "flex items-center p-3 mt-auto rounded-lg bg-gray-50 gap-3 hover:bg-gray-100 w-full",
        elements: [
          {
            type: "Text",
            content: "Guest User",
            styles: {
              default: {
                color: "#333",
                fontSize: "14px",
                fontWeight: "500",
              },
            },
            tailwindStyles: "text-gray-800 text-sm font-medium sm:hidden",
          },
        ],
      },
    ],
    href: "",
    src: "",
  },
};
