import type { MaterialRecord } from "../MaterialTypes";
import { createRNG, dateAdd } from "../../../mocks/shared/utils";

/**
 * 자재(Mock) 데이터 자동 생성기
 * - 시드 기반으로 동일한 더미 데이터 재현 가능
 * - realistic한 코드/명칭 조합 및 생성일 랜덤
 */
export function generateMaterialMock(
  count = 150,
  seed = 20251028
): MaterialRecord[] {
  const rng = createRNG(seed);

  // 자재명 및 코드 prefix 패턴
  const categories = [
    { prefix: "MAT-WIR", names: ["고전압 케이블", "절연선", "연선 케이블"] },
    {
      prefix: "MAT-SCR",
      names: ["스테인리스 나사 M4", "육각 나사", "플랫 나사"],
    },
    { prefix: "MAT-PLT", names: ["알루미늄 플레이트", "강철 플레이트"] },
    { prefix: "MAT-BOL", names: ["육각 볼트 10mm", "스테인리스 볼트"] },
    { prefix: "MAT-BRD", names: ["PCB 제어 보드", "회로 보드", "릴레이 보드"] },
    { prefix: "MAT-FUS", names: ["퓨즈 10A", "퓨즈 5A", "퓨즈 홀더"] },
  ];

  const baseDate = new Date("2025-09-01");

  // 코드 생성 헬퍼
  const genCode = (prefix: string) =>
    `${prefix}-${String(Math.floor(rng() * 900 + 100))}`;

  // 날짜 생성 헬퍼
  const genDate = () => dateAdd(baseDate, Math.floor(rng() * 60)); // 2개월 내 랜덤 날짜

  // 실제 배열 생성
  const materials: MaterialRecord[] = Array.from({ length: count }, (_, i) => {
    const cat = categories[Math.floor(rng() * categories.length)];
    const name = cat.names[Math.floor(rng() * cat.names.length)];
    const code = genCode(cat.prefix);

    const record: MaterialRecord = {
      id: i + 1,
      materialCode: code,
      materialName: name,
      createdDate: genDate(),
    };
    return record;
  });

  return materials;
}
