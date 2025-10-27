import type { Material, PartCate } from "../../bom/BOMTypes";
import { createRNG, dateAdd, pad } from "../../mocks/shared/utils";
import type { PartRecords } from "./PartTypes";

/**
 * PartItem 목데이터 자동 생성기 (시드 고정 가능)
 */
export function generatePartMock(count = 100, seed = 20251027): PartRecords[] {
  const rnd = createRNG(seed);

  const categories: PartCate[] = [
    "카테고리 A",
    "카테고리 B",
    "카테고리 C",
    "카테고리 D",
  ];

  const partPrefixes = [
    { code: "PRT-CON", names: ["고전압 커넥터", "센서 커넥터", "방수 커넥터"] },
    {
      code: "PRT-BRK",
      names: ["센서 브라켓", "서포트 브라켓", "마운트 브라켓"],
    },
    { code: "PRT-PCB", names: ["PCB 어셈블리", "LED PCB 모듈", "컨트롤 PCB"] },
    { code: "PRT-HOU", names: ["하우징 세트", "컨트롤 박스", "라벨 모듈"] },
    { code: "PRT-FAN", names: ["냉각 팬", "소형 냉각팬", "저소음 팬"] },
    { code: "PRT-ADP", names: ["전원 어댑터", "DC 어댑터", "SMPS 어댑터"] },
    { code: "PRT-ARM", names: ["서포트 암", "가이드 암", "힌지 암"] },
    {
      code: "PRT-CAB",
      names: ["케이블 어셈블리", "센서 케이블", "전원 케이블"],
    },
    {
      code: "PRT-PLT",
      names: ["베이스 플레이트", "알루미늄 플레이트", "강철 플레이트"],
    },
    { code: "PRT-LED", names: ["LED 모듈", "조명 모듈", "백라이트 모듈"] },
    { code: "PRT-BOX", names: ["컨트롤 박스", "분전 박스", "인터페이스 박스"] },
    { code: "PRT-RAI", names: ["가이드 레일", "슬라이드 레일", "리니어 레일"] },
    { code: "PRT-HSK", names: ["히트싱크 모듈", "방열 모듈", "열관리 모듈"] },
  ];

  const materialPool = [
    { name: "동 케이블", code: "MAT-CBL-001" },
    { name: "전원 케이블", code: "MAT-CBL-002" },
    { name: "신호선 케이블", code: "MAT-CBL-004" },
    { name: "절연튜브", code: "MAT-TUB-004" },
    { name: "절연테이프", code: "MAT-TAP-102" },
    { name: "스테인리스 판재", code: "MAT-STL-210" },
    { name: "알루미늄 판재", code: "MAT-ALU-202" },
    { name: "알루미늄 봉", code: "MAT-ALU-201" },
    { name: "리벳", code: "MAT-RIV-303" },
    { name: "볼트 M4", code: "MAT-BLT-301" },
    { name: "볼트 M5", code: "MAT-BLT-303" },
    { name: "너트 M4", code: "MAT-NUT-302" },
    { name: "커넥터", code: "MAT-CON-220" },
    { name: "센서 커넥터", code: "MAT-CON-223" },
    { name: "하우징", code: "MAT-HOU-500" },
    { name: "ABS 수지", code: "MAT-ABS-401" },
    { name: "PCB 기판", code: "MAT-PCB-101" },
    { name: "기판 PCB", code: "MAT-PCB-100" },
    { name: "저항 10kΩ", code: "MAT-RES-510" },
    { name: "저항 220Ω", code: "MAT-RES-511" },
    { name: "커패시터 100uF", code: "MAT-CAP-520" },
    { name: "LED 칩", code: "MAT-LED-001" },
    { name: "IC 칩 MCU", code: "MAT-IC-601" },
    { name: "FPCB", code: "MAT-FPC-111" },
    { name: "써멀패드", code: "MAT-THM-101" },
    { name: "트랜스포머", code: "MAT-TRF-900" },
    { name: "모터", code: "MAT-MOT-230" },
    { name: "팬 블레이드", code: "MAT-BLD-130" },
    { name: "스위치", code: "MAT-SWT-710" },
  ];

  const base = new Date("2025-01-05");

  const pick = <T>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const int = (min: number, max: number) =>
    Math.floor(rnd() * (max - min + 1)) + min;

  return Array.from({ length: count }, (_, i) => {
    const family = pick(partPrefixes);
    const partName = pick(family.names);
    const partCode = `${family.code}-${pad(int(100, 999), 3)}`;
    const category = pick(categories);

    // 생성일: 2025-01-05 ~ +20일 범위
    const createdDate = dateAdd(base, int(0, 20));

    // PART-ID: PART-YYMMDD-###
    const yymmdd = createdDate.slice(2).replaceAll("-", "");
    const partId = `PART-${yymmdd}-${pad(i + 1, 3)}`;

    // 자재 2~6개 (중복 최소화)
    const mCount = int(2, 6);
    const usedIdx = new Set<number>();
    const materials: Material[] = Array.from({ length: mCount }).map(() => {
      let idx = int(0, materialPool.length - 1);
      let guard = 0;
      while (usedIdx.has(idx) && guard++ < 10) {
        idx = int(0, materialPool.length - 1);
      }
      usedIdx.add(idx);
      const m = materialPool[idx];
      return {
        materialName: m.name,
        materialCode: m.code,
        materialQty: int(1, 10),
      };
    });

    const rec: PartRecords = {
      partId,
      partName,
      partCode,
      category,
      materials,
      createdDate,
    };
    return rec;
  });
}
