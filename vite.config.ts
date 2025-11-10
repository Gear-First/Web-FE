// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/notification": {
        target: "http://34.120.215.23",
        changeOrigin: true,
        secure: false,
        ws: true,
        followRedirects: true,
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(`[Proxy] ${req.url} -> ${options.target}`);
          });
        },
      },
    },
  },
});
