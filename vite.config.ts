import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const getAllowedHosts = (env: Record<string, string>) => {
  const baseHosts = ["localhost", "127.0.0.1", "0.0.0.0"];

  const additionalHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(",").map((h: string) => h.trim())
    : [];

  const domainPatterns = env.VITE_DOMAIN_PATTERNS
    ? env.VITE_DOMAIN_PATTERNS.split(",").map((p: string) => p.trim())
    : [];

  const autoDetectedHosts = [
    "*.arkafx.com",
    "*.vercel.app",
    "*.netlify.app",
    "*.github.io",
    "*.railway.app",
    "*.render.com",
  ];

  return [...baseHosts, ...additionalHosts, ...domainPatterns, ...autoDetectedHosts];
};

export default defineConfig(({ mode }) => {
  // ✅ Properly load .env variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: getAllowedHosts(env),
    },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs': ['pdfjs-dist']
        }
      }
    }
  }
};
});
