// src/mocks/bom.handlers.ts (혹은 기존 파일)
import { http, HttpResponse } from "msw";
import { mockdata as bomRecords } from "./mockdata";
import { paginate } from "../../mocks/shared/utils";
import type { BOMRecord, BOMCreateDTO, BOMUpdateDTO } from "../BOMTypes";

// 공통 응답 타입
type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

export const bomHandlers = [
  // 목록 + 검색/필터/페이지네이션
  http.get<never, never, ListResponse<BOMRecord[]>>(
    "/api/bom/records",
    ({ request }) => {
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
      return HttpResponse.json({ data: pageData, meta });
    }
  ),

  // 상세
  http.get<{ id: string }, never, BOMRecord | { message: string }>(
    "/api/bom/records/:id",
    ({ params }) => {
      const rec = bomRecords.find((r) => r.bomId === params.id);
      return rec
        ? HttpResponse.json(rec)
        : HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
  ),

  // 생성
  http.post<never, BOMCreateDTO, BOMRecord>(
    "/api/bom/records",
    async ({ request }) => {
      const body = await request.json();

      const created: BOMRecord = {
        bomId: `BOM-${Date.now()}`,
        partName: body.partName.trim(),
        partCode: body.partCode.trim(),
        category: body.category,
        materials: body.materials.map((m) => ({
          materialCode: m.materialCode.trim(),
          materialName: m.materialName.trim(),
          materialQty: Number(m.materialQty),
        })),
        createdDate: new Date().toISOString().slice(0, 10),
      };

      bomRecords.unshift(created);
      return HttpResponse.json(created, { status: 201 });
    }
  ),

  // 수정: bomId/createdDate 무시
  http.patch<{ id: string }, BOMUpdateDTO, BOMRecord | { message: string }>(
    "/api/bom/records/:id",
    async ({ params, request }) => {
      const idx = bomRecords.findIndex((r) => r.bomId === params.id);
      if (idx < 0) {
        return HttpResponse.json({ message: "Not found" }, { status: 404 });
      }

      const patch = (await request.json()) as BOMUpdateDTO;
      const runtimePatch = patch as Record<string, unknown>;

      // 식별/시스템 필드 차단
      delete runtimePatch.bomId;
      delete runtimePatch.createdDate;

      // materials 정제
      if (Array.isArray(runtimePatch.materials)) {
        runtimePatch.materials = (
          runtimePatch.materials as Array<Record<string, unknown>>
        ).map((m) => ({
          materialCode: String(m.materialCode ?? "").trim(),
          materialName: String(m.materialName ?? "").trim(),
          materialQty: Number(m.materialQty ?? 0),
        }));
      }

      bomRecords[idx] = {
        ...bomRecords[idx],
        ...(runtimePatch as BOMUpdateDTO),
      };
      return HttpResponse.json(bomRecords[idx]);
    }
  ),

  // 삭제
  http.delete<
    { id: string },
    never,
    { ok: boolean; removedId: string } | { message: string }
  >("/api/bom/records/:id", ({ params }) => {
    const idx = bomRecords.findIndex((r) => r.bomId === params.id);
    if (idx < 0) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const removed = bomRecords.splice(idx, 1)[0];
    return HttpResponse.json({ ok: true, removedId: removed.bomId });
  }),
];
