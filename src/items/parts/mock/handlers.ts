import { http, HttpResponse } from "msw";
import type { PartCreateDTO, PartRecord, PartUpdateDTO } from "../PartTypes";
import { PartMockdata } from "./mockdata";
import { paginate } from "../../../mocks/shared/utils";

type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export const partHandlers = [
  // 목록 조회
  http.get<never, never, ListResponse<PartRecord[]>>(
    "/api/parts/records",
    ({ request }) => {
      const url = new URL(request.url);
      const q = url.searchParams.get("q");
      const category = url.searchParams.get("category");
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const page = Number(url.searchParams.get("page") ?? 1);
      const pageSize = Number(url.searchParams.get("pageSize") ?? 50);

      let data = PartMockdata.slice();

      if (category && category !== "ALL") {
        data = data.filter(
          (r) =>
            r.category.name === category ||
            String(r.category.id) === String(category)
        );
      }

      if (q && q.trim()) {
        const lower = q.toLowerCase();
        data = data.filter((r) => {
          const base = `${r.partId} ${r.partName} ${r.partCode} ${r.category.name}`
            .toLowerCase()
            .includes(lower);
          return base;
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
    }
  ),

  // 상세 조회 (성공 PartRecord | 실패 {message})
  http.get<{ id: string }, never, PartRecord | { message: string }>(
    "/api/parts/records/:id",
    ({ params }) => {
      const rec = PartMockdata.find((r) => r.partId === params.id);
      return rec
        ? HttpResponse.json(rec)
        : HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
  ),

  // 생성 (RequestBody=PartCreateDTO, ResponseBody=PartRecord)
  http.post<never, PartCreateDTO, PartRecord>(
    "/api/parts/records",
    async ({ request }) => {
      const body = (await request.json()) as PartCreateDTO;

      const created: PartRecord = {
        partId: `PART-${Date.now()}`,
        partName: body.name.trim(),
        partCode: body.code.trim(),
        category: {
          id: body.categoryId,
          name: `카테고리 ${String(body.categoryId)}`,
        },
        createdDate: new Date().toISOString().slice(0, 10),
      };

      PartMockdata.unshift(created);
      return HttpResponse.json(created, { status: 201 });
    }
  ),

  // 수정 (성공 PartRecord | 실패 {message})
  http.patch<{ id: string }, PartUpdateDTO, PartRecord | { message: string }>(
    "/api/parts/records/:id",
    async ({ params, request }) => {
      const idx = PartMockdata.findIndex((r) => r.partId === params.id);
      if (idx < 0) {
        return HttpResponse.json({ message: "Not found" }, { status: 404 });
      }

      const patch = (await request.json()) as PartUpdateDTO;
      const target = { ...PartMockdata[idx] };

      if (patch.code) target.partCode = patch.code.trim();
      if (patch.name) target.partName = patch.name.trim();
      if (patch.categoryId !== undefined) {
        target.category = {
          id: patch.categoryId,
          name: `카테고리 ${String(patch.categoryId)}`,
        };
      }
      if (patch.enabled !== undefined) {
        target.enabled = !!patch.enabled;
      }

      PartMockdata[idx] = target;
      return HttpResponse.json(PartMockdata[idx]);
    }
  ),

  // 삭제 (성공 {ok, removedId} | 실패 {message})
  http.delete<
    { id: string },
    never,
    { ok: boolean; removedId: string } | { message: string }
  >("/api/parts/records/:id", ({ params }) => {
    const idx = PartMockdata.findIndex((r) => r.partId === params.id);
    if (idx < 0) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const removed = PartMockdata.splice(idx, 1)[0];
    return HttpResponse.json({ ok: true, removedId: removed.partId });
  }),
];
