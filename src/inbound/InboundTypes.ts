export type InboundStatus = "합격" | "보류" | "불합격";

export interface InboundRecord {
  inboundId: string;
  lotId: string;
  partName: string;
  partCode: string;
  inboundQty: number;
  receivedDate: string;
  expectedInDate: string;
  inDate: string;
  warehouse: string;
  status: InboundStatus;
  inspector: string;
  vendor: string;
  note: string;
}
