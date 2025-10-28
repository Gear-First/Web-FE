import type { PartCate } from "../../bom/BOMTypes";
import type { PartRecords, PartCreateDTO, PartUpdateDTO } from "./PartTypes";
import {
  type ApiResponse,
  type ListResponse,
  WAREHOUSE_ENDPOINTS,
} from "../../api";

/** React Query keys */
export const partKeys = {
  records: ["part", "records"] as const,
  detail: (id: string) => ["part", "detail", id] as const,
};

// 목록 조회 파라미터 (UI 기준: 1-based page)
export type PartListParams = {
  q?: string; // 서버는 name/code로 받음 → 아래에서 둘 다에 매핑
  category?: PartCate | "ALL";
  startDate?: string | null; // 서버 미지원 → 전송 안 함
  endDate?: string | null; // 서버 미지원 → 전송 안 함
  page?: number; // 1-based
  pageSize?: number;
};

type ServerPartItem = {
  id: number | string;
  code: string;
  name: string;
  category?: {
    id: number | string;
    name: string;
  };
};

type ServerPartList = {
  items: ServerPartItem[];
  page: number; // 서버 반환 page (예시 상 1-based로 보임)
  size: number;
  total: number; // totalElements
};

/* -------------------- 매핑 유틸 -------------------- */

/** (선택) PartCate → 서버 categoryId 매핑
 *  백엔드 카테고리 아이디 테이블이 정해지면 채워주세요.
 */
const PART_CATE_TO_ID: Partial<Record<PartCate, number | string>> = {
  // 예: engine: 1, electrical: 2, body: 3, ...
};

/** 서버 → 앱 모델 */
function toPartRecord(s: ServerPartItem): PartRecords {
  return {
    partId: String(s.id),
    partCode: s.code,
    partName: s.name,
    category: (s.category?.name as PartCate) ?? ("기타" as PartCate),
    materials: [], // 서버 응답에 없음 → 빈 배열로
    createdDate: "", // 서버 응답에 없음 → 필요시 서버 확장
  };
}

// 쿼리스트링 빌더 (서버 지원 파라미터만 전송)
function buildQuery(params?: PartListParams) {
  const qs = new URLSearchParams();
  if (!params) return qs;

  // 페이지: UI 1-based → 서버도 1-based로 보임(예시 쿼리 page=1)
  if (params.page != null) qs.set("page", String(Math.max(1, params.page)));
  if (params.pageSize != null) qs.set("size", String(params.pageSize));

  // 검색어: 서버는 code/name 각각 지원 → 둘 다에 같은 값 전송(OR 검색 기대)
  const q = params.q?.trim();
  if (q) {
    qs.set("code", q);
    qs.set("name", q);
  }

  // 카테고리: "ALL"은 전송 안 함. 매핑 테이블에 있으면 id 전송
  if (params.category && params.category !== "ALL") {
    const cateId = PART_CATE_TO_ID[params.category];
    if (cateId != null) qs.set("categoryId", String(cateId));
  }

  // 날짜 필터는 서버 미지원 → 전송 생략
  return qs;
}

/* -------------------- API -------------------- */

// 목록 조회: 실서버 사용 (/warehouse/api/v1/parts)
export async function fetchPartRecords(
  params?: PartListParams
): Promise<ListResponse<PartRecords[]>> {
  const qs = buildQuery(params);
  const url = qs.toString()
    ? `${WAREHOUSE_ENDPOINTS.PARTS_LIST}?${qs.toString()}`
    : `${WAREHOUSE_ENDPOINTS.PARTS_LIST}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Part 목록 요청 실패 (${res.status})`);

  const json: ApiResponse<ServerPartList> = await res.json();
  if (!json.success) throw new Error(json.message || "부품 목록 조회 실패");

  const page = json.data;
  const rows = page.items.map(toPartRecord);

  // totalPages는 서버가 주지 않으므로 계산
  const totalPages =
    page.size > 0 ? Math.max(1, Math.ceil(page.total / page.size)) : 1;

  return {
    data: rows,
    meta: {
      total: page.total,
      page: page.page ?? 1, // 서버 1-based로 가정
      pageSize: page.size,
      totalPages,
    },
  };
}

// 상세/생성/수정/삭제: 기존(MSW) 엔드포인트 유지
export async function fetchPartDetail(id: string): Promise<PartRecords> {
  const res = await fetch(`/api/parts/records/${id}`);
  if (!res.ok) throw new Error(`Part 상세 요청 실패 (${res.status})`);
  return res.json();
}

export async function createPart(payload: PartCreateDTO): Promise<PartRecords> {
  const res = await fetch(`/api/parts/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Part 생성 실패 (${res.status})`);
  return res.json();
}

export async function updatePart(
  id: string,
  patch: PartUpdateDTO
): Promise<PartRecords> {
  const res = await fetch(`/api/parts/records/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Part 수정 실패 (${res.status})`);
  return res.json();
}

export async function deletePart(
  id: string
): Promise<{ ok: boolean; removedId: string }> {
  const res = await fetch(`/api/parts/records/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Part 삭제 실패 (${res.status})`);
  return res.json();
}
