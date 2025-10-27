// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";
import { paginate } from "../../../mocks/shared/utils";
import { MaterialMockdata } from "./mockdata"; // 새 Material 목데이터(배열)
import type {
  MaterialRecords,
  MaterialCreateDTO,
  MaterialUpdateDTO,
} from "../MaterialTypes";

// 공통 응답 타입
type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export const materialHandlers = [
  // 목록 (+검색/날짜/페이지네이션)
  http.get<never, never, ListResponse<MaterialRecords[]>>(
    "/api/materials/records",
    ({ request }) => {
      const url = new URL(request.url);
      const q = url.searchParams.get("q");
      const startDate = url.searchParams.get("startDate");
      const endDate = url.searchParams.get("endDate");
      const page = Number(url.searchParams.get("page") ?? 1);
      const pageSize = Number(url.searchParams.get("pageSize") ?? 50);

      let data = MaterialMockdata.slice();

      if (q && q.trim()) {
        const lower = q.toLowerCase();
        data = data.filter((r) =>
          `${r.materialId} ${r.materialName} ${r.materialCode}`
            .toLowerCase()
            .includes(lower)
        );
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
      return HttpResponse.json({ data: pageData, meta });
    }
  ),

  // 상세
  http.get<{ id: string }, never, MaterialRecords | { message: string }>(
    "/api/materials/records/:id",
    ({ params }) => {
      const rec = MaterialMockdata.find((r) => r.materialId === params.id);
      return rec
        ? HttpResponse.json(rec)
        : HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
  ),

  // 생성
  http.post<never, MaterialCreateDTO, MaterialRecords>(
    "/api/materials/records",
    async ({ request }) => {
      const body = await request.json();

      const created: MaterialRecords = {
        materialId: `MAT-${Date.now()}`,
        materialCode: body.materialCode.trim(),
        materialName: body.materialName.trim(),
        createdDate: new Date().toISOString().slice(0, 10),
      };

      MaterialMockdata.unshift(created);
      return HttpResponse.json(created, { status: 201 });
    }
  ),

  // 수정
  http.patch<
    { id: string },
    MaterialUpdateDTO,
    MaterialRecords | { message: string }
  >("/api/materials/records/:id", async ({ params, request }) => {
    const idx = MaterialMockdata.findIndex((r) => r.materialId === params.id);
    if (idx < 0) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }

    const patch = (await request.json()) as MaterialUpdateDTO;
    const runtimePatch = patch as Record<string, unknown>;
    delete runtimePatch.materialId;

    const safePatch = runtimePatch as MaterialUpdateDTO;

    MaterialMockdata[idx] = { ...MaterialMockdata[idx], ...safePatch };
    return HttpResponse.json(MaterialMockdata[idx]);
  }),

  // 삭제
  http.delete<
    { id: string },
    never,
    { ok: boolean; removedId: string } | { message: string }
  >("/api/materials/records/:id", ({ params }) => {
    const idx = MaterialMockdata.findIndex((r) => r.materialId === params.id);
    if (idx < 0) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const removed = MaterialMockdata.splice(idx, 1)[0];
    return HttpResponse.json({ ok: true, removedId: removed.materialId });
  }),
];
