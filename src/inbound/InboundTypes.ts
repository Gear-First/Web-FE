export type QualityStatus = "합격" | "보류" | "불합격";

export interface InboundRecord {
  inboundId: string;
  LotId: string;
  partName: string;
  partCode: string;
  inboundQty: number;
  receivedDate: string;
  expectedInDate: string;
  inDate: string;
  warehouse: string;
  status: QualityStatus;
  inspector: string;
  vendor: string;
  note: string;
}
