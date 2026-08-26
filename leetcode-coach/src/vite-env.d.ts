/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_BETA_ENABLED?: string
  readonly VITE_PUBLIC_FEEDBACK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
