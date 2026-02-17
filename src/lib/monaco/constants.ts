export const DEFAULT_EDITOR_VALUE = `import React from 'react';

export function Hello() {
  return <div>Hello JSX</div>;
}
`;

export const MONACO_COMPILER_OPTIONS = {
  jsx: 1, // monaco.languages.typescript.JsxEmit.Preserve (Value is 1)
  target: 99, // monaco.languages.typescript.ScriptTarget.ESNext/ES2020 (Value is 99)
  allowJs: true,
  lib: ["es2020", "dom"],
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  module: 99, // monaco.languages.typescript.ModuleKind.ESNext (Value is 99)
  moduleResolution: 2, // monaco.languages.typescript.ModuleResolutionKind.NodeJs (Value is 2)
  typeRoots: ["file:///node_modules/@types", "file:///node_modules"],
  types: ["react", "react-dom"],
  paths: {
    "@/*": ["file:///src/*"],
  },
  baseUrl: "file:///",
};

export const MONACO_EXTERNAL_LIBS = [
  {
    url: "https://unpkg.com/@types/react@19.2.2/index.d.ts",
    path: "file:///node_modules/@types/react/index.d.ts",
  },
  {
    url: "https://unpkg.com/@types/react@19.2.2/jsx-runtime.d.ts",
    path: "file:///node_modules/@types/react/jsx-runtime.d.ts",
  },
  {
    url: "https://unpkg.com/@types/react-dom@19.2.2/index.d.ts",
    path: "file:///node_modules/@types/react-dom/index.d.ts",
  },
  {
    url: "https://unpkg.com/csstype@3.2.2/index.d.ts",
    path: "file:///node_modules/csstype/index.d.ts",
  },
];
