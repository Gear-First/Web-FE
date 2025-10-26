import type { InboundRecord } from "../InboundTypes";

/** 간단한 LCG(Linear Congruential Generator) — 재현 가능한 난수 */
function createRNG(seed = 123456789) {
  let s = seed >>> 0;
  return {
    next() {
      // 파라미터는 Numerical Recipes 계열
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 0xffffffff;
    },
    pick<T>(arr: T[]) {
      return arr[Math.floor(this.next() * arr.length)];
    },
    int(min: number, max: number) {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    bool(p = 0.5) {
      return this.next() < p;
    },
  };
}

const PART_POOL = [
  { code: "MAT-WIR-550", name: "고전압 케이블" },
  { code: "MAT-SCR-302", name: "스테인리스 나사 M4" },
  { code: "MAT-PLT-220", name: "알루미늄 플레이트" },
  { code: "MAT-BOL-114", name: "육각 볼트 10mm" },
  { code: "MAT-SWT-440", name: "리미트 스위치" },
  { code: "MAT-BRD-820", name: "제어 보드 PCB" },
  { code: "MAT-COI-705", name: "구리 코일" },
  { code: "MAT-CAP-300", name: "전해 콘덴서 100µF" },
  { code: "MAT-TUB-110", name: "열수축튜브 6mm" },
  { code: "MAT-PLS-880", name: "ABS 플라스틱 케이스" },
  { code: "MAT-RLY-520", name: "릴레이 24V" },
  { code: "MAT-FUS-130", name: "퓨즈 10A" },
  { code: "MAT-GAS-430", name: "실리콘 가스켓" },
  { code: "MAT-LBL-222", name: "제품 라벨 스티커" },
  { code: "MAT-BOX-720", name: "포장 박스 500x300" },
];

const WAREHOUSES = [
  "창고 A-01",
  "창고 A-02",
  "창고 A-03",
  "창고 B-01",
  "창고 B-02",
  "창고 B-03",
  "창고 B-04",
  "창고 C-01",
  "창고 C-02",
  "창고 D-01",
  "창고 D-02",
  "창고 D-03",
];
const INSPECTORS = [
  "박철수",
  "이민재",
  "최정우",
  "김민아",
  "이수빈",
  "정하늘",
  "박진수",
];
const VENDORS = [
  "공급처A",
  "공급처B",
  "공급처C",
  "공급처D",
  "공급처E",
  "공급처F",
  "공급처G",
  "공급처H",
  "공급처I",
  "공급처J",
  "공급처K",
  "공급처L",
  "공급처M",
  "공급처N",
];

type Status = "합격" | "불합격" | "보류";

function weightedStatus(rng: ReturnType<typeof createRNG>): Status {
  // 가중치: 합격 75%, 보류 15%, 불합격 10%
  const x = rng.next();
  if (x < 0.75) return "합격";
  if (x < 0.9) return "보류";
  return "불합격";
}

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 기준일로부터 오프셋 일수를 더한 날짜 문자열 반환 */
function dateAdd(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/** YYYY-MM-DD → YYMMDD */
function yymmdd(iso: string) {
  return iso.slice(2).replaceAll("-", "");
}

/** 고유 inboundId/lotId 만든다: 예) RCV-251024-001, LOT-251019-001 */
function makeIds(
  idx: number,
  receivedDate: string,
  rng: ReturnType<typeof createRNG>
) {
  const lotDate = dateAdd(new Date(receivedDate), -rng.int(1, 5)); // lot은 보통 며칠 전
  const rcv = `RCV-${yymmdd(receivedDate)}-${pad(idx, 3)}`;
  const lot = `LOT-${yymmdd(lotDate)}-${pad(idx, 3)}`;
  return { inboundId: rcv, lotId: lot };
}

/** 메모: 기본 범위 2025-09-20 ~ 2025-10-20 사이에서 랜덤 생성 */
export function generateInboundMock(
  count: number,
  seed = 20251026
): InboundRecord[] {
  const rng = createRNG(seed);
  const start = new Date("2025-09-20");
  const end = new Date("2025-10-20");
  const spanDays = Math.ceil((+end - +start) / (1000 * 60 * 60 * 24));

  const rows: InboundRecord[] = [];
  for (let i = 1; i <= count; i++) {
    const part = rng.pick(PART_POOL);
    const receivedDate = dateAdd(start, rng.int(0, spanDays)); // 입고일
    const expectedInDate = dateAdd(new Date(receivedDate), rng.int(1, 3));
    const inDate = dateAdd(new Date(receivedDate), rng.int(0, 2));

    const status = weightedStatus(rng);
    const { inboundId, lotId } = makeIds(i, receivedDate, rng);

    const record: InboundRecord = {
      inboundId,
      lotId,
      partCode: part.code,
      partName: part.name,
      inboundQty: rng.int(50, 5000),
      receivedDate,
      expectedInDate,
      inDate,
      warehouse: rng.pick(WAREHOUSES),
      status,
      inspector: rng.pick(INSPECTORS),
      vendor: rng.pick(VENDORS),
      note:
        status === "불합격"
          ? rng.pick([
              "납땜 불량 발견",
              "정격 전류 오차 초과",
              "치수 편차 초과",
              "표면 스크래치 확인",
            ])
          : status === "보류"
          ? rng.pick([
              "두께 편차 확인 중",
              "인쇄 불량 확인 중",
              "추가 샘플 확인 중",
              "포장 손상 의심",
            ])
          : "",
    };

    rows.push(record);
  }
  return rows;
}
