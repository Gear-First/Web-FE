import type { BOMRecord } from "./BOMTypes";

export const bomKeys = {
  records: ["bom", "records"] as const,
};

export const bomRecords: BOMRecord[] = [
  {
    bomId: "BOM-250101-01",
    partName: "고전압 커넥터",
    partCode: "PRT-CON-101",
    category: "카테고리 A",
    materials: [
      {
        materialName: "동 케이블",
        materialCode: "MAT-CBL-001",
        materialQty: 2,
      },
      { materialName: "절연튜브", materialCode: "MAT-TUB-004", materialQty: 1 },
    ],
    createdDate: "2025-01-05",
  },
  {
    bomId: "BOM-250101-02",
    partName: "센서 브라켓",
    partCode: "PRT-BRK-203",
    category: "카테고리 B",
    materials: [
      {
        materialName: "스테인리스 판재",
        materialCode: "MAT-STL-210",
        materialQty: 1,
      },
      { materialName: "M4 볼트", materialCode: "MAT-BLT-301", materialQty: 4 },
      { materialName: "M4 너트", materialCode: "MAT-NUT-302", materialQty: 4 },
    ],
    createdDate: "2025-01-06",
  },
  {
    bomId: "BOM-250101-03",
    partName: "PCB 어셈블리",
    partCode: "PRT-PCB-110",
    category: "카테고리 C",
    materials: [
      { materialName: "기판 PCB", materialCode: "MAT-PCB-100", materialQty: 1 },
      {
        materialName: "저항 10kΩ",
        materialCode: "MAT-RES-510",
        materialQty: 4,
      },
      {
        materialName: "커패시터 100uF",
        materialCode: "MAT-CAP-520",
        materialQty: 2,
      },
      { materialName: "IC 칩 MCU", materialCode: "MAT-IC-601", materialQty: 1 },
    ],
    createdDate: "2025-01-06",
  },
  {
    bomId: "BOM-250101-04",
    partName: "하우징 세트",
    partCode: "PRT-HOU-320",
    category: "카테고리 D",
    materials: [
      { materialName: "ABS 수지", materialCode: "MAT-ABS-401", materialQty: 2 },
      {
        materialName: "스냅 클립",
        materialCode: "MAT-CLP-105",
        materialQty: 2,
      },
    ],
    createdDate: "2025-01-07",
  },
  {
    bomId: "BOM-250101-05",
    partName: "냉각 팬",
    partCode: "PRT-FAN-501",
    category: "카테고리 B",
    materials: [
      {
        materialName: "팬 블레이드",
        materialCode: "MAT-BLD-130",
        materialQty: 1,
      },
      { materialName: "모터", materialCode: "MAT-MOT-230", materialQty: 1 },
      {
        materialName: "전원 케이블",
        materialCode: "MAT-CBL-002",
        materialQty: 1,
      },
    ],
    createdDate: "2025-01-07",
  },
  {
    bomId: "BOM-250101-06",
    partName: "LED 모듈",
    partCode: "PRT-LED-140",
    category: "카테고리 C",
    materials: [
      { materialName: "LED 칩", materialCode: "MAT-LED-001", materialQty: 6 },
      { materialName: "PCB 기판", materialCode: "MAT-PCB-101", materialQty: 1 },
      {
        materialName: "저항 220Ω",
        materialCode: "MAT-RES-511",
        materialQty: 3,
      },
    ],
    createdDate: "2025-01-08",
  },
  {
    bomId: "BOM-250101-07",
    partName: "전원 어댑터",
    partCode: "PRT-ADP-150",
    category: "카테고리 A",
    materials: [
      {
        materialName: "트랜스포머",
        materialCode: "MAT-TRF-900",
        materialQty: 1,
      },
      {
        materialName: "전원 케이스",
        materialCode: "MAT-CAS-700",
        materialQty: 1,
      },
      { materialName: "케이블", materialCode: "MAT-CBL-003", materialQty: 1 },
    ],
    createdDate: "2025-01-08",
  },
  {
    bomId: "BOM-250101-08",
    partName: "서포트 암",
    partCode: "PRT-ARM-250",
    category: "카테고리 B",
    materials: [
      {
        materialName: "알루미늄 봉",
        materialCode: "MAT-ALU-201",
        materialQty: 1,
      },
      {
        materialName: "조인트 피스",
        materialCode: "MAT-JNT-202",
        materialQty: 2,
      },
    ],
    createdDate: "2025-01-09",
  },
  {
    bomId: "BOM-250101-09",
    partName: "라벨 모듈",
    partCode: "PRT-LAB-310",
    category: "카테고리 C",
    materials: [
      { materialName: "센서", materialCode: "MAT-SNS-101", materialQty: 1 },
      { materialName: "하우징", materialCode: "MAT-HOU-500", materialQty: 1 },
      { materialName: "FPCB", materialCode: "MAT-FPC-111", materialQty: 1 },
    ],
    createdDate: "2025-01-09",
  },
  {
    bomId: "BOM-250101-10",
    partName: "케이블 어셈블리",
    partCode: "PRT-CAB-100",
    category: "카테고리 A",
    materials: [
      {
        materialName: "고전압 케이블",
        materialCode: "MAT-WIR-550",
        materialQty: 2,
      },
      { materialName: "커넥터", materialCode: "MAT-CON-220", materialQty: 2 },
      {
        materialName: "절연테이프",
        materialCode: "MAT-TAP-102",
        materialQty: 1,
      },
    ],
    createdDate: "2025-01-10",
  },
  {
    bomId: "BOM-250101-11",
    partName: "베이스 플레이트",
    partCode: "PRT-PLT-410",
    category: "카테고리 B",
    materials: [
      {
        materialName: "알루미늄 판재",
        materialCode: "MAT-ALU-202",
        materialQty: 1,
      },
      { materialName: "리벳", materialCode: "MAT-RIV-303", materialQty: 6 },
    ],
    createdDate: "2025-01-10",
  },
  {
    bomId: "BOM-250101-12",
    partName: "컨트롤 박스",
    partCode: "PRT-BOX-520",
    category: "카테고리 A",
    materials: [
      { materialName: "스위치", materialCode: "MAT-SWT-710", materialQty: 2 },
      { materialName: "하우징", materialCode: "MAT-HOU-505", materialQty: 1 },
      { materialName: "커넥터", materialCode: "MAT-CON-221", materialQty: 2 },
    ],
    createdDate: "2025-01-11",
  },
  {
    bomId: "BOM-250101-13",
    partName: "센서 케이블",
    partCode: "PRT-CAB-200",
    category: "카테고리 C",
    materials: [
      {
        materialName: "신호선 케이블",
        materialCode: "MAT-CBL-004",
        materialQty: 1,
      },
      {
        materialName: "센서 커넥터",
        materialCode: "MAT-CON-223",
        materialQty: 2,
      },
    ],
    createdDate: "2025-01-11",
  },
  {
    bomId: "BOM-250101-14",
    partName: "가이드 레일",
    partCode: "PRT-RAI-130",
    category: "카테고리 B",
    materials: [
      { materialName: "철 레일", materialCode: "MAT-STL-215", materialQty: 1 },
      { materialName: "볼트 M5", materialCode: "MAT-BLT-303", materialQty: 4 },
    ],
    createdDate: "2025-01-12",
  },
  {
    bomId: "BOM-250101-15",
    partName: "히트싱크 모듈",
    partCode: "PRT-HSK-601",
    category: "카테고리 B",
    materials: [
      {
        materialName: "알루미늄 핀",
        materialCode: "MAT-ALU-203",
        materialQty: 10,
      },
      { materialName: "써멀패드", materialCode: "MAT-THM-101", materialQty: 2 },
    ],
    createdDate: "2025-01-12",
  },
];

export async function fetchBOMRecords(): Promise<BOMRecord[]> {
  // 실제 API 호출 필요
  return bomRecords;
}

export async function createBOM(): Promise<void> {
  return;
}

export async function updateBOM(): Promise<void> {
  return;
}

export async function deleteBOM(): Promise<void> {
  return;
}
