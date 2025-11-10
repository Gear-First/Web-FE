import type { PropertyRecord } from "../PropertyTypes";

/** 간단한 LCG(Linear Congruential Generator) — 재현 가능한 난수 */
function createRNG(seed = 123456789) {
  let s = seed >>> 0;
  return {
    next() {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 0xffffffff;
    },
    pick<T>(arr: T[]) {
      return arr[Math.floor(this.next() * arr.length)];
    },
    int(min: number, max: number) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
  };
}

const WAREHOUSES = [
  "창고 1",
  "창고 2",
  "창고 3",
  "창고 4",
  "창고 5",
  "창고 6",
  "창고 7",
  "창고 8",
  "창고 9",
  "창고 10",
  "창고 11",
  "창고 12",
  "창고 13",
  "창고 14",
];

const PART_POOL = [
  { code: "P001", name: "모터" },
  { code: "P002", name: "센서 모듈" },
  { code: "P003", name: "컨트롤 보드" },
  { code: "P004", name: "커넥터 케이블" },
  { code: "P005", name: "냉각팬" },
  { code: "P006", name: "PCB 보드" },
  { code: "P007", name: "볼트 세트" },
  { code: "P008", name: "고무 패킹" },
  { code: "P009", name: "히터 코일" },
  { code: "P010", name: "플라스틱 커버" },
  { code: "P011", name: "릴레이 모듈" },
  { code: "P012", name: "터치패드" },
  { code: "P013", name: "전원 어댑터" },
  { code: "P014", name: "기어 세트" },
  { code: "P015", name: "베어링" },
  { code: "P016", name: "LED 모듈" },
  { code: "P017", name: "배선 하네스" },
  { code: "P018", name: "히트 싱크" },
  { code: "P019", name: "케이블 타이" },
  { code: "P020", name: "안전 퓨즈" },
  { code: "P021", name: "로터" },
  { code: "P022", name: "스프링" },
  { code: "P023", name: "기판 클램프" },
  { code: "P024", name: "배터리 팩" },
  { code: "P025", name: "에어 필터" },
  { code: "P026", name: "패널 커버" },
  { code: "P027", name: "실링 고무" },
  { code: "P028", name: "히트 파이프" },
  { code: "P029", name: "컨트롤 스위치" },
  { code: "P030", name: "온도 센서" },
];

/** id 필드 포함 */
export function generatePropertyMock(
  count: number,
  seed = 20251026
): PropertyRecord[] {
  const rng = createRNG(seed);
  const rows: PropertyRecord[] = [];

  // for문 그대로, seen 제거
  for (let i = 0; i < count; i++) {
    const part = rng.pick(PART_POOL);
    const warehouse = rng.pick(WAREHOUSES);
    rows.push({
      id: crypto.randomUUID(),
      warehouseId: warehouse,
      warehouseCode: warehouse,
      partCode: part.code,
      partName: part.name,
      partQuantity: rng.int(0, 500),
      partPrice: rng.int(1000, 10000),
    });
  }

  return rows;
}
