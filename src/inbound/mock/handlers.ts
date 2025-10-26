import { http, HttpResponse } from "msw";
import { mockdata as inboundRecords } from "./mockdata";

export const handlers = [
  http.get("/api/inbound/records", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 50);

    let data = inboundRecords.slice();

    if (status && status !== "ALL")
      data = data.filter((r) => r.status === status);
    if (q && q.trim()) {
      const lower = q.toLowerCase();
      data = data.filter((r) =>
        `${r.inboundId} ${r.partName} ${r.vendor} ${r.partCode}`
          .toLowerCase()
          .includes(lower)
      );
    }
    if (startDate || endDate) {
      const s = startDate ? new Date(startDate) : null;
      const e = endDate ? new Date(endDate) : null;
      data = data.filter((r) => {
        const d = new Date(r.receivedDate);
        return (s ? d >= s : true) && (e ? d <= e : true);
      });
    }

    const total = data.length;
    const start = (page - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);

    return HttpResponse.json({
      data: pageData,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  }),
];
