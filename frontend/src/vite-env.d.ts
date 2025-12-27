/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// SCSS modules type declaration
declare module '*.module.scss' {
  export const classes: { [key: string]: string };
}

declare module '*.scss' {
  export const content: string;
}
