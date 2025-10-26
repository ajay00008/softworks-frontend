import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Dynamic allowedHosts configuration
const getAllowedHosts = () => {
  const baseHosts = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0"
  ];

  // Get additional hosts from environment variables
  const additionalHosts = process.env.VITE_ALLOWED_HOSTS?.split(',').map(host => host.trim()) || [];
  
  // Get domain patterns from environment
  const domainPatterns = process.env.VITE_DOMAIN_PATTERNS?.split(',').map(pattern => pattern.trim()) || [];
  
  // Auto-detect common development domains
  const autoDetectedHosts = [
    "*.arkafx.com", // Allow all arkafx.com subdomains
    "*.vercel.app", // Allow Vercel deployments
    "*.netlify.app", // Allow Netlify deployments
    "*.github.io", // Allow GitHub Pages
    "*.railway.app", // Allow Railway deployments
    "*.render.com", // Allow Render deployments
  ];

  return [
    ...baseHosts,
    ...additionalHosts,
    ...domainPatterns,
    ...autoDetectedHosts
  ];
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: getAllowedHosts(),
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
}));
