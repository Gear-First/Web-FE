import { createRNG, dateAdd, pad } from "../../../mocks/shared/utils";
import type { PartRecord } from "../PartTypes";

/**
 * PartItem 목데이터 자동 생성기 (시드 고정 가능)
 */
export function generatePartMock(count = 100, seed = 20251027): PartRecord[] {
  const rnd = createRNG(seed);

  const categories = [
    { id: 1, name: "카테고리 A" },
    { id: 2, name: "카테고리 B" },
    { id: 3, name: "카테고리 C" },
    { id: 4, name: "카테고리 D" },
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

    const rec: PartRecord = {
      partId,
      partName,
      partCode,
      category,
      createdDate,
    };
    return rec;
  });
}
