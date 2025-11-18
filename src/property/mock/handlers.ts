import { http, HttpResponse } from "msw";
import { mockdata as propertyRecords } from "./mockdata";

export const propertyHandlers = [
  http.get("/api/property/records", ({ request }) => {
    const url = new URL(request.url);
    const warehouse = url.searchParams.get("warehouse") || undefined;
    const keyword = url.searchParams.get("keyword")?.toLowerCase() || "";
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "10");

    let data = propertyRecords.slice();

    if (warehouse) data = data.filter((r) => r.warehouseId === warehouse);
    if (keyword)
      data = data.filter((r) =>
        `${r.partCode} ${r.partName}`.toLowerCase().includes(keyword)
      );
    const total = data.length;
    const start = (page - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);

    const warehouses = Array.from(
      new Set(propertyRecords.map((r) => r.warehouseId))
    ).sort();

    return HttpResponse.json({
      data: pageData,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      facets: { warehouses },
    });
  }),
];
