export type QualityStatus = "합격" | "보류" | "불합격";

export interface InboundRecord {
  id: string;
  purchaseOrderId: string;
  materialCode: string;
  materialName: string;
  quantityReceived: number;
  unit: string;
  receivedDate: string;
  storageLocation: string;
  qualityStatus: QualityStatus;
  inspector: string;
  lotNumber: string;
}
