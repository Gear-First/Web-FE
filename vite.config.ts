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
          const server = proxy as unknown as {
            on: (event: string, listener: (...args: unknown[]) => void) => void;
          };
          server.on("proxyReq", (...args: unknown[]) => {
            const req = args[1] as { url?: string } | undefined;
            console.log(`[Proxy] ${req?.url ?? ""} -> ${options.target}`);
          });
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
