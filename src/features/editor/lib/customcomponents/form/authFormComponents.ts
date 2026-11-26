import type { CustomComponent } from "../types";

export const loginFormComponent: CustomComponent = {
  component: {
    type: "Form",
    name: "Supabase Login Form",
    content: "",
    tailwindStyles:
      "w-full max-w-md mx-auto rounded-xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-4",
    settings: {
      authAction: "login",
      method: "post",
    },
    elements: [
      {
        type: "Heading",
        name: "LoginHeading",
        content: "Sign in to your account",
        tailwindStyles: "text-2xl font-semibold tracking-tight text-zinc-900",
        settings: { level: 2 },
      },
      {
        type: "Text",
        name: "LoginSubtitle",
        content: "Enter your email and password to continue.",
        tailwindStyles: "text-sm text-zinc-500 -mt-2",
      },
      {
        type: "Frame",
        name: "EmailField",
        content: "",
        tailwindStyles: "flex flex-col gap-1.5 w-full",
        elements: [
          {
            type: "Label",
            content: "Email",
            tailwindStyles: "text-sm font-medium text-zinc-700",
          },
          {
            type: "Input",
            content: "",
            tailwindStyles:
              "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900",
            settings: {
              name: "email",
              type: "email",
              placeholder: "you@example.com",
              required: true,
              autoComplete: "email",
            },
          },
        ],
      },
      {
        type: "Frame",
        name: "PasswordField",
        content: "",
        tailwindStyles: "flex flex-col gap-1.5 w-full",
        elements: [
          {
            type: "Label",
            content: "Password",
            tailwindStyles: "text-sm font-medium text-zinc-700",
          },
          {
            type: "Input",
            content: "",
            tailwindStyles:
              "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900",
            settings: {
              name: "password",
              type: "password",
              placeholder: "••••••••",
              required: true,
              autoComplete: "current-password",
            },
          },
        ],
      },
      {
        type: "Button",
        name: "LoginSubmit",
        content: "Sign In",
        tailwindStyles:
          "w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer",
        settings: {
          buttonType: "submit",
        },
      },
    ],
  },
};

export const signupFormComponent: CustomComponent = {
  component: {
    type: "Form",
    name: "Supabase Sign Up Form",
    content: "",
    tailwindStyles:
      "w-full max-w-md mx-auto rounded-xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-4",
    settings: {
      authAction: "signup",
      method: "post",
      successMessage: "Check your email to confirm your account.",
    },
    elements: [
      {
        type: "Heading",
        name: "SignupHeading",
        content: "Create your account",
        tailwindStyles: "text-2xl font-semibold tracking-tight text-zinc-900",
        settings: { level: 2 },
      },
      {
        type: "Text",
        name: "SignupSubtitle",
        content: "Sign up with your email to get started.",
        tailwindStyles: "text-sm text-zinc-500 -mt-2",
      },
      {
        type: "Frame",
        name: "NameField",
        content: "",
        tailwindStyles: "flex flex-col gap-1.5 w-full",
        elements: [
          {
            type: "Label",
            content: "Full name",
            tailwindStyles: "text-sm font-medium text-zinc-700",
          },
          {
            type: "Input",
            content: "",
            tailwindStyles:
              "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900",
            settings: {
              name: "name",
              type: "text",
              placeholder: "Ada Lovelace",
              autoComplete: "name",
            },
          },
        ],
      },
      {
        type: "Frame",
        name: "EmailField",
        content: "",
        tailwindStyles: "flex flex-col gap-1.5 w-full",
        elements: [
          {
            type: "Label",
            content: "Email",
            tailwindStyles: "text-sm font-medium text-zinc-700",
          },
          {
            type: "Input",
            content: "",
            tailwindStyles:
              "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900",
            settings: {
              name: "email",
              type: "email",
              placeholder: "you@example.com",
              required: true,
              autoComplete: "email",
            },
          },
        ],
      },
      {
        type: "Frame",
        name: "PasswordField",
        content: "",
        tailwindStyles: "flex flex-col gap-1.5 w-full",
        elements: [
          {
            type: "Label",
            content: "Password",
            tailwindStyles: "text-sm font-medium text-zinc-700",
          },
          {
            type: "Input",
            content: "",
            tailwindStyles:
              "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900",
            settings: {
              name: "password",
              type: "password",
              placeholder: "At least 6 characters",
              required: true,
              autoComplete: "new-password",
            },
          },
        ],
      },
      {
        type: "Button",
        name: "SignupSubmit",
        content: "Create Account",
        tailwindStyles:
          "w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer",
        settings: {
          buttonType: "submit",
        },
      },
    ],
  },
};

export const magicLinkFormComponent: CustomComponent = {
  component: {
    type: "Form",
    name: "Supabase Magic Link Form",
    content: "",
    tailwindStyles:
      "w-full max-w-md mx-auto rounded-xl border border-zinc-200 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-4",
    settings: {
      authAction: "magic-link",
      method: "post",
      successMessage: "Check your inbox for your sign-in link.",
    },
    elements: [
      {
        type: "Heading",
        name: "MagicLinkHeading",
        content: "Passwordless sign in",
        tailwindStyles: "text-2xl font-semibold tracking-tight text-zinc-900",
        settings: { level: 2 },
      },
      {
        type: "Text",
        name: "MagicLinkSubtitle",
        content: "We'll email you a one-click sign-in link.",
        tailwindStyles: "text-sm text-zinc-500 -mt-2",
      },
      {
        type: "Frame",
        name: "EmailField",
        content: "",
        tailwindStyles: "flex flex-col gap-1.5 w-full",
        elements: [
          {
            type: "Label",
            content: "Email",
            tailwindStyles: "text-sm font-medium text-zinc-700",
          },
          {
            type: "Input",
            content: "",
            tailwindStyles:
              "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900",
            settings: {
              name: "email",
              type: "email",
              placeholder: "you@example.com",
              required: true,
              autoComplete: "email",
            },
          },
        ],
      },
      {
        type: "Button",
        name: "MagicLinkSubmit",
        content: "Send Sign-In Link",
        tailwindStyles:
          "w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition-colors cursor-pointer",
        settings: {
          buttonType: "submit",
        },
      },
    ],
  },
};
