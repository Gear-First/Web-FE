import type {
  InboundPartItem,
  InboundRecord,
  InboundStatus,
} from "../InboundTypes";
import { createRNG, dateAdd } from "../../mocks/shared/utils";

/**
 * 입고 데이터 자동 생성기
 * - 시드 기반으로 매번 같은 데이터 생성 (테스트 및 개발 시 일관성 보장)
 * - 날짜, 상태, 공급처, 자재명을 랜덤으로 섞어 realistic한 데이터 구성
 */

export function generateInboundMock(
  count = 200,
  seed = 20251027
): InboundRecord[] {
  const rng = createRNG(seed);

  const statuses: InboundStatus[] = ["합격", "보류", "불합격"];
  const warehouses = [
    "창고 A-01",
    "창고 A-02",
    "창고 B-01",
    "창고 B-02",
    "창고 C-01",
    "창고 D-01",
  ];
  const inspectors = [
    "박철수",
    "이민재",
    "김민아",
    "정하늘",
    "최정우",
    "이수빈",
    "박진수",
  ];
  const vendors = [
    "공급처A",
    "공급처B",
    "공급처C",
    "공급처D",
    "공급처E",
    "공급처F",
    "공급처G",
    "공급처H",
  ];

  const partCodes = [
    "MAT-WIR",
    "MAT-SCR",
    "MAT-PLT",
    "MAT-BOL",
    "MAT-SWT",
    "MAT-BRD",
    "MAT-RLY",
    "MAT-FUS",
  ];
  const partNames = [
    "고전압 케이블",
    "스테인리스 나사 M4",
    "알루미늄 플레이트",
    "육각 볼트 10mm",
    "리미트 스위치",
    "제어 보드 PCB",
    "릴레이 24V",
    "퓨즈 10A",
  ];

  const baseDate = new Date("2025-09-20");

  const makePart = (): InboundPartItem => {
    const prefix = partCodes[Math.floor(rng() * partCodes.length)];
    const name = partNames[Math.floor(rng() * partNames.length)];
    const code = `${prefix}-${String(Math.floor(rng() * 900 + 100))}`;
    const qty = Math.floor(rng() * 400) + 10; // 10~409
    const st = statuses[Math.floor(rng() * statuses.length)];
    return {
      partCode: code,
      partName: name,
      partQty: qty,
      status: st,
    };
  };

  return Array.from({ length: count }).map((_, i) => {
    const prefix = partCodes[Math.floor(rng() * partCodes.length)];

    const partName = partNames[Math.floor(rng() * partNames.length)];
    const partCode = `${prefix}-${String(Math.floor(rng() * 900 + 100))}`;

    const inboundId = `RCV-25${String(920 + Math.floor(rng() * 30))}-${String(
      i + 1
    ).padStart(2, "0")}`;
    const lotId = `LOT-25${String(915 + Math.floor(rng() * 30))}-${String(
      i + 1
    ).padStart(2, "0")}`;

    const receivedDate = dateAdd(baseDate, Math.floor(rng() * 20)); // 입고일 랜덤 (20일 이내)
    const expectedInDate = dateAdd(
      new Date(receivedDate),
      2 + Math.floor(rng() * 3)
    ); // 예정일
    const inDate = dateAdd(new Date(receivedDate), 1 + Math.floor(rng() * 3)); // 실제 입고일

    const partQty = 1 + Math.floor(rng() * 4);
    const parts = Array.from({ length: partQty }, makePart);

    const statusRank = (s: InboundStatus) =>
      s === "불합격" ? 3 : s === "보류" ? 2 : 1;
    const partStatus: InboundStatus = parts.reduce(
      (acc, p) => (statusRank(p.status) > statusRank(acc) ? p.status : acc),
      "합격" as InboundStatus
    );

    const inboundQty = parts.reduce((sum, p) => sum + p.partQty, 0);
    const warehouse = warehouses[Math.floor(rng() * warehouses.length)];

    const hasFail = parts.some((p) => p.status === "불합격");
    const hasHold = parts.some((p) => p.status === "보류");
    const status: InboundStatus = hasFail
      ? "불합격"
      : hasHold
      ? "보류"
      : "합격";

    const inspector = inspectors[Math.floor(rng() * inspectors.length)];
    const vendor = vendors[Math.floor(rng() * vendors.length)];

    const note =
      status === "보류"
        ? "품질 검수 중"
        : status === "불합격"
        ? "외관 불량 확인"
        : "";

    return {
      inboundId,
      lotId,
      partCode,
      partName,
      inboundQty,
      receivedDate,
      expectedInDate,
      inDate,
      parts,
      partQty,
      partStatus,
      warehouse,
      status,
      inspector,
      vendor,
      note,
    };
  });
}
