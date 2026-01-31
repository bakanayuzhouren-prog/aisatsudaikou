
// Manual declaration of ImportMeta interfaces to bypass missing vite/client definition error
interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
