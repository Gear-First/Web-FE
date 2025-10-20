import type { InboundRecord } from "./InboundTypes";

export const inboundKeys = {
  records: ["inbound", "records"] as const,
};

export const inboundRecords: InboundRecord[] = [
  {
    id: "RCV-240920-01",
    purchaseOrderId: "PO-240915-01",
    materialCode: "MAT-WIR-550",
    materialName: "고전압 케이블",
    quantityReceived: 520,
    unit: "m",
    receivedDate: "2024-09-20",
    storageLocation: "창고 A-01",
    qualityStatus: "합격",
    inspector: "박지훈",
    lotNumber: "LOT-2409-01",
  },
  {
    id: "RCV-240920-02",
    purchaseOrderId: "PO-240915-01",
    materialCode: "MAT-WIR-550",
    materialName: "고전압 케이블",
    quantityReceived: 480,
    unit: "m",
    receivedDate: "2024-09-20",
    storageLocation: "창고 A-02",
    qualityStatus: "보류",
    inspector: "박지훈",
    lotNumber: "LOT-2409-02",
  },
  {
    id: "RCV-240918-01",
    purchaseOrderId: "PO-240918-02",
    materialCode: "MAT-SNS-331",
    materialName: "ABS 센서",
    quantityReceived: 600,
    unit: "EA",
    receivedDate: "2024-09-18",
    storageLocation: "창고 B-11",
    qualityStatus: "합격",
    inspector: "윤서현",
    lotNumber: "LOT-2409-11",
  },
  {
    id: "RCV-240915-03",
    purchaseOrderId: "PO-240910-03",
    materialCode: "MAT-BRK-120",
    materialName: "브레이크 패드",
    quantityReceived: 1000,
    unit: "EA",
    receivedDate: "2024-09-15",
    storageLocation: "창고 C-05",
    qualityStatus: "불합격",
    inspector: "김태린",
    lotNumber: "LOT-2409-21",
  },
];

export async function fetchInboundRecords(): Promise<InboundRecord[]> {
  // 실제 API 호출 필요
  return inboundRecords;
}
