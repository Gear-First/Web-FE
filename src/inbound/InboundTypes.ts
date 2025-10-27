export type InboundStatus = "합격" | "보류" | "불합격";

export interface InboundPartItem {
  partCode: string;
  partName: string;
  partQty: number;
  status: InboundStatus;
}

export interface InboundRecord {
  inboundId: string;
  lotId: string;
  parts: InboundPartItem[];
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
