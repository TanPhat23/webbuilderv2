import { CustomComponent } from "../customComponents";
import { v4 as uuidv4 } from "uuid";

// Contact Form
export const formComponent1: CustomComponent = {
  component: {
    type: "Form",
    name: "Form1",
    content: "",
    styles: {
      default: {
        width: "100%",
        margin: "0 auto",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.07)",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      },
    },
    tailwindStyles:
      "w-full mx-auto rounded-xl shadow-lg bg-white flex flex-col overflow-hidden p-4 md:p-6",
    elements: [
      {
        type: "Frame",
        name: "FormHeader",
        content: "",
        styles: {
          default: {
            width: "100%",
            marginBottom: "16px",
          },
        },
        tailwindStyles: "w-full mb-3 md:mb-5",
        elements: [
          {
            type: "Text",
            content: "Thông tin liên hệ",
            styles: {
              default: {
                fontSize: "24px",
                fontWeight: "700",
                color: "#111827",
                padding: "12px 0",
                width: "100%",
                textAlign: "center",
              },
            },
            tailwindStyles:
              "text-xl md:text-2xl font-bold text-gray-900 py-2 md:py-3 text-center w-full",
            href: "",
            src: "",
          },
        ],
        href: "",
        src: "",
      },
      {
        type: "Frame",
        name: "ContentContainer",
        content: "",
        styles: {
          default: {
            display: "flex",
            flexDirection: "row",
            width: "100%",
            padding: "0px 24px 24px",
            gap: "24px",
          },
        },
        tailwindStyles:
          "w-full flex flex-col md:flex-row px-2 md:px-5 gap-5 md:gap-6",
        elements: [
          {
            type: "Image",
            name: "ContactImage",
            content: "",
            styles: {
              default: {
                width: "40%",
                objectFit: "cover",
                borderRadius: "8px",
                height: "100%",
              },
            },
            tailwindStyles:
              "w-full md:w-2/5 h-56 md:h-auto object-cover rounded-lg mb-5 md:mb-0",
            href: "",
            src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
          },
          {
            type: "Frame",
            name: "FormContainer",
            content: "",
            styles: {
              default: {
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "60%",
              },
            },
            tailwindStyles: "w-full md:w-3/5 flex flex-col gap-4 md:gap-5",
            elements: [
              {
                type: "Frame",
                name: "NameInputGroup",
                content: "",

                styles: {
                  default: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    width: "100%",
                  },
                },
                tailwindStyles: "flex flex-col gap-2 w-full mb-3 md:mb-0",
                elements: [
                  {
                    type: "Text",
                    content: "Họ và tên",

                    styles: {
                      default: {
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                      },
                    },
                    tailwindStyles: "text-sm font-medium text-gray-700",
                    href: "",
                    src: "",
                  },
                  {
                    type: "Input",
                    content: "",

                    styles: {
                      default: {
                        padding: "10px 14px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        width: "100%",
                        fontSize: "14px",
                      },
                    },
                    tailwindStyles:
                      "w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    href: "",
                    src: "",
                    settings: {
                      type: "text",
                      placeholder: "",
                      required: true,
                      name: "name",
                    },
                  },
                ],
                href: "",
                src: "",
              },
              {
                type: "Frame",
                name: "ContactInfoGroup",
                content: "",

                styles: {
                  default: {
                    display: "flex",
                    flexDirection: "row",
                    gap: "16px",
                    width: "100%",
                  },
                },
                tailwindStyles: "flex flex-col sm:flex-row gap-4 w-full",
                elements: [
                  {
                    type: "Frame",
                    name: "EmailInputGroup",
                    content: "",

                    styles: {
                      default: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        width: "50%",
                      },
                    },
                    tailwindStyles:
                      "flex flex-col gap-2 w-full sm:w-1/2 mb-3 sm:mb-0 sm:mr-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Email",

                        styles: {
                          default: {
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                          },
                        },
                        tailwindStyles: "text-sm font-medium text-gray-700",
                        href: "",
                        src: "",
                      },
                      {
                        type: "Input",
                        content: "",

                        styles: {
                          default: {
                            padding: "10px 14px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            width: "100%",
                            fontSize: "14px",
                          },
                        },
                        tailwindStyles:
                          "w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        href: "",
                        src: "",
                        settings: {
                          type: "email",
                          placeholder: "",
                          required: true,
                          name: "email",
                        },
                      },
                    ],
                    href: "",
                    src: "",
                  },
                  {
                    type: "Frame",
                    name: "PhoneInputGroup",
                    content: "",
                    styles: {
                      default: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        width: "50%",
                      },
                    },
                    tailwindStyles:
                      "flex flex-col gap-2 w-full sm:w-1/2 sm:ml-2",
                    elements: [
                      {
                        type: "Text",
                        content: "Số điện thoại",
                        styles: {
                          default: {
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#374151",
                          },
                        },
                        tailwindStyles: "text-sm font-medium text-gray-700",
                        href: "",
                        src: "",
                      },
                      {
                        type: "Input",
                        content: "",
                        styles: {
                          default: {
                            padding: "10px 14px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            width: "100%",
                            fontSize: "14px",
                          },
                        },
                        tailwindStyles:
                          "w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        href: "",
                        src: "",
                        settings: {
                          type: "tel",
                          placeholder: "",
                          required: false,
                          name: "phone",
                        },
                      },
                    ],
                    href: "",
                    src: "",
                  },
                ],
                href: "",
                src: "",
              },
              {
                type: "Frame",
                name: "MessageInputGroup",

                content: "",

                styles: {
                  default: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    width: "100%",
                  },
                },
                tailwindStyles: "flex flex-col gap-2 w-full mt-3 md:mt-0",
                elements: [
                  {
                    type: "Text",
                    content: "Nội dung liên hệ",

                    styles: {
                      default: {
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                      },
                    },
                    tailwindStyles: "text-sm font-medium text-gray-700",
                    href: "",
                    src: "",
                  },
                  {
                    type: "Frame",
                    content: "",
                    styles: {
                      default: {
                        padding: "10px 14px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        width: "100%",
                        fontSize: "14px",
                        minHeight: "140px",
                      },
                    },
                    tailwindStyles:
                      "w-full px-3.5 py-2.5 border border-gray-300 rounded-md text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[140px]",
                    href: "",
                    src: "",
                    elements: [
                      {
                        type: "Input",
                        content: "",
                        styles: {
                          default: {
                            width: "100%",
                            height: "100%",
                            border: "none",
                            outline: "none",
                            resize: "none",
                          },
                        },
                        tailwindStyles:
                          "w-full h-full border-none outline-none resize-none bg-transparent",
                        href: "",
                        src: "",
                        settings: {
                          type: "textarea",
                          placeholder: "",
                          required: true,
                          name: "message",
                        },
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
        ],
        href: "",
        src: "",
      },
      {
        type: "Button",
        content: "Submit",
        styles: {
          default: {
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            padding: "12px 20px",
            fontWeight: "500",
            fontSize: "14px",
            cursor: "pointer",
            border: "none",
            width: "100%",
            borderRadius: "6px",
          },
        },
        tailwindStyles:
          "bg-blue-500 hover:bg-blue-600 text-white py-3 px-5 font-medium text-sm cursor-pointer border-none w-full rounded-md transition-colors mt-4 md:mt-6",
        href: "",
        src: "",
      },
    ],
    href: "",
    src: "",

    settings: {
      method: "post",
      autoComplete: "on", // Changed from autocomplete to autoComplete to match FormSettings interface
      validateOnSubmit: false, // Changed from noValidate to validateOnSubmit
    },
  },
};

// Simple Newsletter Form
export const formComponent2: CustomComponent = {
  component: {
    type: "Form",
    name: "Newsletter Form",

    settings: {
      method: "post",
      autoComplete: "on",
    },
    styles: {
      default: {
        width: "100%",
        margin: "0 auto",
        padding: "32px",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.07)",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
    },
    tailwindStyles:
      "w-full mx-auto rounded-xl shadow-lg bg-white flex flex-col items-center p-6 md:p-8",
    elements: [
      {
        type: "Text",
        content: "Subscribe to our Newsletter",

        styles: {
          default: {
            fontSize: "24px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "8px",
            textAlign: "center",
          },
        },
        tailwindStyles:
          "text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center",
        href: "",
        src: "",
      },
      {
        type: "Text",
        content: "Get the latest updates and news delivered to your inbox.",

        styles: {
          default: {
            fontSize: "16px",
            color: "#6b7280",
            marginBottom: "24px",
            textAlign: "center",
          },
        },
        tailwindStyles: "text-base text-gray-500 mb-6 text-center",
        href: "",
        src: "",
      },
      {
        type: "Frame",
        name: "InputGroup",

        content: "",

        styles: {
          default: {
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            width: "100%",
            maxWidth: "400px",
          },
        },
        tailwindStyles: "flex flex-col sm:flex-row gap-3 w-full max-w-md",
        elements: [
          {
            type: "Input",
            content: "",

            styles: {
              default: {
                padding: "12px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "14px",
                flex: "1",
              },
            },
            tailwindStyles:
              "flex-1 px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            href: "",
            src: "",
            settings: {
              type: "email",
              placeholder: "Enter your email",
              required: true,
              name: "email",
            },
          },
          {
            type: "Button",
            content: "Subscribe",

            styles: {
              default: {
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                padding: "12px 24px",
                fontWeight: "500",
                fontSize: "14px",
                cursor: "pointer",
                border: "none",
                borderRadius: "6px",
              },
            },
            tailwindStyles:
              "bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 font-medium text-sm cursor-pointer border-none rounded-md transition-colors",
            href: "",
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
