
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Fixed property 'cwd' does not exist on type 'Process' by casting process to any to access Node.js runtime environment
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    define: {
      "process.env": {},
    },
    build: {
      target: "esnext",
    }
  };
});
