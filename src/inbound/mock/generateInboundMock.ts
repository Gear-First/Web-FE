import type { InboundRecord, InboundStatus } from "../InboundTypes";
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

  const statusPool: Array<{ group: InboundStatus; raw: string }> = [
    { group: "done", raw: "COMPLETED_OK" },
    { group: "done", raw: "COMPLETED_ISSUE" },
    { group: "not-done", raw: "PENDING" },
    { group: "not-done", raw: "IN_PROGRESS" },
  ];
  const warehouses = ["WH-A1", "WH-A2", "WH-B1", "WH-B2", "WH-C1", "WH-D1"];
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

  const baseDate = new Date("2025-09-20");

  return Array.from({ length: count }).map((_, i) => {
    const vendor = vendors[Math.floor(rng() * vendors.length)];
    const statusDef =
      statusPool[Math.floor(rng() * statusPool.length)] ?? statusPool[0];
    const noteId = 1000 + i;
    const receivingNo = `RCV-${String(250900 + i).padStart(6, "0")}-${String(
      Math.floor(rng() * 90) + 10
    )}`;
    const requestedAt = dateAdd(baseDate, Math.floor(rng() * 14));
    const completedAt =
      statusDef.group === "done"
        ? dateAdd(new Date(requestedAt), Math.floor(rng() * 5))
        : null;
    const totalQty = Math.floor(rng() * 500) + 20;
    const itemKindsNumber = Math.floor(rng() * 5) + 1;

    return {
      noteId,
      receivingNo,
      supplierName: vendor,
      itemKindsNumber,
      totalQty,
      status: statusDef.group,
      statusRaw: statusDef.raw,
      completedAt,
      requestedAt,
      warehouseCode: warehouses[Math.floor(rng() * warehouses.length)],
    };
  });
}
