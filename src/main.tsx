import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

async function enableMocking() {
  if (import.meta.env && import.meta.env.MODE === "development") {
    const { worker } = await import("./routes/browser");
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* 개발 중 디버깅용: 선택사항 */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>
  );
});
