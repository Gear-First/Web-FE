// src/mocks/bom.handlers.ts (혹은 기존 파일)
import { http, HttpResponse } from "msw";
import { mockdata as bomRecords } from "./mockdata";
import { paginate } from "../../mocks/shared/utils";
import type {
  BOMRecord,
  BOMCreateDTO,
  BOMUpdateDTO,
  Material,
} from "../BOMTypes";

// 공통 응답 타입
type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};

const fallbackCategories = ["카테고리 A", "카테고리 B", "카테고리 C"];

const materialLabel = (id: number) =>
  `자재 ${String(id).padStart(3, "0")}`;
const materialCode = (id: number) => `MAT-${String(id).padStart(4, "0")}`;

const toMaterialFromInfo = (
  info: BOMCreateDTO["materialInfos"][number],
  idx = 0
): Material => {
  const materialId = Number(info.materialId ?? idx + 1);
  return {
    materialId,
    materialName: materialLabel(materialId),
    materialCode: materialCode(materialId),
    materialQty: Number(info.quantity ?? 0) || 0,
  };
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
            `${r.bomCodeId} ${r.partName} ${r.partCode} ${r.category}`.toLowerCase();
          const mats = (r.materials ?? [])
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
      const rec = bomRecords.find((r) => r.bomCodeId === params.id);
      return rec
        ? HttpResponse.json(rec)
        : HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
  ),

  // 생성
  http.post<never, BOMCreateDTO, BOMRecord>(
    "/api/bom/records",
    async ({ request }) => {
      const body = (await request.json()) as BOMCreateDTO;
      const partIdStr = String(body.partId);
      const template =
        bomRecords.find((r) => r.partId === partIdStr) ?? bomRecords[0];
      const now = new Date();
      const bomCodeId = `BOM-${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(
        Math.floor(Math.random() * 900) + 100
      )}`;
      const bomCode =
        template?.bomCode ??
        `B-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const materials = Array.isArray(body.materialInfos)
        ? body.materialInfos.map(toMaterialFromInfo)
        : [];
      const created: BOMRecord = {
        bomCodeId,
        bomCode,
        category: template?.category ?? fallbackCategories[0],
        partId: partIdStr,
        partCode:
          template?.partCode ?? `PART-${String(body.partId).padStart(4, "0")}`,
        partName: template?.partName ?? `부품 ${partIdStr}`,
        materials,
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
      const idx = bomRecords.findIndex((r) => r.bomCodeId === params.id);
      if (idx < 0) {
        return HttpResponse.json({ message: "Not found" }, { status: 404 });
      }

      const patch = (await request.json()) as BOMUpdateDTO;
      const target = { ...bomRecords[idx] };

      if (patch.partId !== undefined) {
        target.partId = String(patch.partId);
      }

      if (Array.isArray(patch.materialInfos)) {
        target.materials = patch.materialInfos.map(toMaterialFromInfo);
      }

      bomRecords[idx] = target;
      return HttpResponse.json(bomRecords[idx]);
    }
  ),

  // 삭제
  http.delete<
    { id: string },
    never,
    { ok: boolean; removedId: string } | { message: string }
  >("/api/bom/records/:id", ({ params }) => {
    const idx = bomRecords.findIndex((r) => r.bomCodeId === params.id);
    if (idx < 0) {
      return HttpResponse.json({ message: "Not found" }, { status: 404 });
    }
    const removed = bomRecords.splice(idx, 1)[0];
    return HttpResponse.json({ ok: true, removedId: removed.bomCodeId });
  }),
];
