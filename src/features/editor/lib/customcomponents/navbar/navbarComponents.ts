import { CustomComponent } from "../customComponents";
import { v4 as uuidv4 } from "uuid";

export const navbarComponent: CustomComponent = {
  component: {
    type: "Frame",
    name: "NavBar",
    content: "",
    styles: {
      default: {
        height: "auto",
        minHeight: "50px",
        width: "100%",
        backgroundColor: "white",
        display: "flex",
        gap: "15px",
        padding: "15px 10px",
      },
    },
    tailwindStyles:
      "min-h-[50px] w-full bg-white flex flex-col md:flex-row items-center justify-center md:justify-start p-4 md:px-8 gap-4 md:gap-6",
    elements: [
      {
        type: "Image",
        content: "Logo",
        styles: {
          default: {
            color: "black",
            transition:
              "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
          },
        },
        tailwindStyles:
          "w-32 text-sm md:text-base md:text-left text-center text-gray-800 hover:scale-105 transition-transform",
        href: "/",
        src: "",
      },
      {
        type: "Link",
        content: "Home",
        styles: {
          default: {
            color: "black",
            display: "flex",
            alignItems: "center",
            transition:
              "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
          },
        },
        tailwindStyles:
          "m-0 text-sm md:text-base text-gray-800 flex items-center hover:text-white hover:bg-blue-500 hover:shadow-md hover:scale-105 transition-transform",
        href: "/",
        src: "",
      },
      {
        type: "Link",
        content: "About",
        styles: {
          default: {
            color: "black",
            display: "flex",
            alignItems: "center",
            transition:
              "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
          },
        },
        tailwindStyles:
          "m-0 text-sm md:text-base text-gray-800 flex items-center hover:text-white hover:bg-blue-500 hover:shadow-md hover:scale-105 transition-transform",
        href: "/",
        src: "",
      },
    ],
    href: "",
    src: "",
  },
};

export const navbarComponent2: CustomComponent = {
  component: {
    type: "Frame",
    name: "NavBar2",
    content: "",

    styles: {
      default: {
        height: "auto",
        minHeight: "80px",
        width: "100%",
        backgroundColor: "#222831",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
      },
    },
    tailwindStyles:
      "min-h-[80px] w-full bg-[#222831] flex flex-col items-center gap-4 py-4 px-4 text-white md:flex-row md:justify-between md:px-8",
    elements: [
      {
        type: "Image",
        content: "LOGO",
        href: "",
        src: "",
        styles: {
          default: {
            width: "80px",
            height: "80px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        },
        tailwindStyles: "w-20 h-20 flex justify-center items-center",
      },
      {
        type: "Frame",
        name: "Links",
        content: "",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "white",
          },
        },
        tailwindStyles:
          "flex flex-col items-center  gap-4 md:flex-row md:gap-8 md:w-auto",
        elements: [
          {
            type: "Link",
            content: "Dashboard",
            styles: {
              default: {
                color: "white",
                fontSize: "16px",
                transition:
                  "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
              },
            },
            tailwindStyles:
              "px-4 py-2 text-white rounded-lg hover:text-gray-900 hover:bg-linear-to-r hover:from-green-400 hover:to-blue-500 hover:shadow-lg hover:scale-105 transition-transform",
            href: "/",
            src: "",
          },
          {
            type: "Link",
            content: "Users",
            styles: {
              default: {
                color: "#d1d1d1",
                fontSize: "16px",
                transition:
                  "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
              },
            },
            tailwindStyles:
              "px-4 py-2 text-gray-300 hover:bg-gray-800 rounded flex items-center justify-start md:text-left sm:text-sm sm:px-2 sm:py-1",
            href: "/",
            src: "",
          },
          {
            type: "Link",
            content: "Settings",
            styles: {
              default: {
                color: "#d1d1d1",
                fontSize: "16px",
                transition:
                  "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
              },
            },
            tailwindStyles:
              "px-4 py-2 text-gray-300 hover:bg-gray-800 rounded flex items-center justify-start md:text-left sm:text-sm sm:px-2 sm:py-1",
            href: "/",
            src: "",
          },
          {
            type: "Button",
            name: "Dropdown Menu",
            content: "Advanced Options",
            href: "",
            src: "",
            tailwindStyles:
              "px-4 py-2 text-gray-300 hover:bg-gray-800 rounded flex items-center justify-between md:text-left sm:text-sm sm:px-2 sm:py-1",
            styles: {
              default: {
                color: "#d1d1d1",
                fontSize: "16px",
                width: "100%",
                padding: "10px 15px",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "background-color 0.2s",
                border: "none",
                backgroundColor: "transparent",
              },
            },
          },
        ],
        href: "",
        src: "",
      },
    ],
    href: "",
  },
};

export const navbarComponent3: CustomComponent = {
  component: {
    type: "Frame",
    name: "NavBar3",
    content: "",

    styles: {
      default: {
        height: "auto",
        minHeight: "65px",
        width: "100%",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        gap: "15px",
        padding: "10px",
      },
    },
    tailwindStyles:
      "min-h-[65px] py-4 w-full bg-[#f8f9fa] flex flex-col md:flex-row items-center justify-center shadow-md gap-4 md:gap-6",
    elements: [
      {
        type: "Link",
        content: "Home",
        styles: {
          default: {
            color: "#333",
            margin: "0 20px",
            fontWeight: "500",
            fontSize: "17px",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "all 0.3s ease",
          },
        },
        tailwindStyles:
          "text-gray-800 font-medium rounded hover:bg-blue-100 whitespace-nowrap px-4 py-2",
        href: "/",
        src: "",
      },
      {
        type: "Link",
        content: "Products",
        styles: {
          default: {
            color: "#333",
            margin: "0 20px",
            fontWeight: "500",
            fontSize: "17px",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "all 0.3s ease",
          },
        },
        tailwindStyles:
          "text-gray-800 font-medium px-2 py-1 rounded hover:bg-blue-100 text-sm md:text-base whitespace-nowrap",
        href: "/",
        src: "",
      },
      {
        type: "Link",
        content: "Gallery",
        styles: {
          default: {
            color: "#333",
            margin: "0 20px",
            fontWeight: "500",
            fontSize: "17px",
            padding: "8px 16px",
            borderRadius: "4px",
            transition: "all 0.3s ease",
          },
        },
        tailwindStyles:
          "text-gray-800 font-medium rounded hover:bg-blue-100 whitespace-nowrap px-4 py-2",
        href: "/",
        src: "",
      },
      {
        type: "Link",
        content: "Contact",
        styles: {
          default: {
            color: "white",
            margin: "0 20px",
            fontWeight: "500",
            fontSize: "17px",
            padding: "8px 16px",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            transition: "all 0.3s ease",
          },
        },
        tailwindStyles:
          "text-white font-medium rounded bg-blue-500 hover:bg-blue-600 whitespace-nowrap px-4 py-2",
        href: "/",
        src: "",
      },
    ],
    href: "",
    src: "",
  },
};

export const navbarComponent4: CustomComponent = {
  component: {
    type: "Frame",
    name: "NavBar4",
    content: "",

    styles: {
      default: {
        height: "auto",
        minHeight: "70px",
        width: "100%",
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 30px",
        borderBottom: "1px solid #e0e0e0",
      },
    },
    tailwindStyles:
      "min-h-[70px] py-4 w-full bg-transparent flex flex-col md:flex-row items-center justify-between px-6 md:px-8 border-b border-gray-300 gap-6 md:gap-8",
    elements: [
      {
        type: "Text",
        content: "BRAND",
        styles: {
          default: {
            color: "#333",
            fontWeight: "bold",
            fontSize: "22px",
            letterSpacing: "1px",
          },
        },
        tailwindStyles:
          "text-gray-800 font-bold text-base md:text-xl tracking-wide",
        href: "",
        src: "",
      },
      {
        type: "Frame",
        name: "NavMenu",
        styles: {
          default: {
            display: "flex",
            alignItems: "center",
            gap: "20px",
          },
        },
        tailwindStyles:
          "flex flex-col md:flex-row items-center gap-6 md:gap-10",
        elements: [
          {
            type: "Link",
            content: "Home",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                position: "relative",
                textDecoration: "none",
                transition:
                  "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
              },
            },
            tailwindStyles:
              "text-gray-800 text-sm md:text-base relative no-underline rounded-lg hover:text-white hover:bg-linear-to-r hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:scale-105 transition-transform px-4 py-2",
            href: "/",
            src: "",
          },
          {
            type: "Link",
            content: "About",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                position: "relative",
                textDecoration: "none",
                transition:
                  "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
              },
            },
            tailwindStyles:
              "text-gray-800 text-sm md:text-base relative no-underline rounded-lg hover:text-white hover:bg-linear-to-r hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:scale-105 transition-transform px-4 py-2",
            href: "/",
            src: "",
          },
          {
            type: "Link",
            content: "Services",
            styles: {
              default: {
                color: "#333",
                fontSize: "16px",
                position: "relative",
                textDecoration: "none",
                transition:
                  "background-color 0.4s ease, color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
              },
            },
            tailwindStyles:
              "text-gray-800 text-sm md:text-base relative no-underline rounded-lg hover:text-white hover:bg-linear-to-r hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:scale-105 transition-transform px-4 py-2",
            href: "/",
            src: "",
          },
        ],
        href: "",
        src: "",
      },
    ],
    href: "",
    src: "",
  },
};

export const navbarComponent5: CustomComponent = {
  component: {
    type: "Frame",
    name: "NavBar5",
    styles: {
      default: {
        color: "white",
        fontWeight: "bold",
        fontSize: "20px",
      },
    },
    tailwindStyles:
      "text-white font-bold text-lg md:text-xl shrink-0 px-4 py-2",
    href: "",
    src: "",
    elements: [
      {
        type: "Link",
        content: "Dashboard",
        styles: {
          default: {
            color: "white",
            fontSize: "16px",
          },
        },
        tailwindStyles:
          "text-white text-sm md:text-base shrink-0 hover:bg-purple-600 hover:text-gray-200 hover:scale-105 transition-transform px-4 py-2",
        href: "/",
        src: "",
      },
      {
        type: "Link",
        content: "Projects",
        styles: {
          default: {
            color: "white",
            fontSize: "16px",
          },
        },
        tailwindStyles:
          "text-white text-sm md:text-base shrink-0 hover:bg-purple-600 hover:text-gray-200 hover:scale-105 transition-transform px-4 py-2",
        href: "/",
        src: "",
      },
      {
        type: "Link",
        content: "Tasks",
        styles: {
          default: {
            color: "white",
            fontSize: "16px",
          },
        },
        tailwindStyles:
          "text-white text-sm md:text-base shrink-0 hover:bg-purple-600 hover:text-gray-200 hover:scale-105 transition-transform px-4 py-2",
        href: "/",
        src: "",
      },
      {
        type: "Link",
        content: "Settings",
        styles: {
          default: {
            color: "white",
            fontSize: "16px",
          },
        },
        tailwindStyles:
          "text-white text-sm md:text-base shrink-0 hover:bg-purple-600 hover:text-gray-200 hover:scale-105 transition-transform px-4 py-2",
        href: "/",
        src: "",
      },
    ],
  },
};
