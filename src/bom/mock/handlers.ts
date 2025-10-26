import { http, HttpResponse } from "msw";
import { mockdata as bomRecords } from "./mockdata";
import { paginate } from "../../mocks/shared/utils";

// 공통 응답 타입
type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export const bomHandlers = [
  // 목록 + 검색/필터/페이지네이션
  http.get("/api/bom/records", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const category = url.searchParams.get("category");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 50);

    let data = bomRecords.slice();

    if (category && category !== "ALL") {
      data = data.filter((r) => r.category === category);
    }

    if (q && q.trim()) {
      const lower = q.toLowerCase();
      data = data.filter((r) => {
        const base =
          `${r.bomId} ${r.partName} ${r.partCode} ${r.category}`.toLowerCase();
        const mats = r.materials
          .map((m) => `${m.materialName} ${m.materialCode}`.toLowerCase())
          .join(" ");
        return (base + " " + mats).includes(lower);
      });
    }

    if (startDate || endDate) {
      const s = startDate ? new Date(startDate) : null;
      const e = endDate ? new Date(endDate) : null;
      data = data.filter((r) => {
        const d = new Date(r.createdDate);
        return (s ? d >= s : true) && (e ? d <= e : true);
      });
    }

    const { data: pageData, meta } = paginate(data, page, pageSize);
    const resp: ListResponse<typeof pageData> = { data: pageData, meta };
    return HttpResponse.json(resp);
  }),

  // 상세
  http.get("/api/bom/records/:id", ({ params }) => {
    const rec = bomRecords.find((r) => r.bomId === params.id);
    return rec
      ? HttpResponse.json(rec)
      : HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),

  // 생성
  http.post("/api/bom/records", async ({ request }) => {
    const body = await request.json();
    // 아주 단순 검증/ID 발급
    const id = `BOM-${Date.now()}`;
    const created = { ...body, bomId: id };
    bomRecords.unshift(created); // 메모리 내 추가
    return HttpResponse.json(created, { status: 201 });
  }),

  // 수정
  http.patch("/api/bom/records/:id", async ({ params, request }) => {
    const idx = bomRecords.findIndex((r) => r.bomId === params.id);
    if (idx < 0) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const patch = await request.json();
    bomRecords[idx] = { ...bomRecords[idx], ...patch };
    return HttpResponse.json(bomRecords[idx]);
  }),

  // 삭제
  http.delete("/api/bom/records/:id", ({ params }) => {
    const idx = bomRecords.findIndex((r) => r.bomId === params.id);
    if (idx < 0) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const removed = bomRecords.splice(idx, 1)[0];
    return HttpResponse.json({ ok: true, removedId: removed.bomId });
  }),
];
