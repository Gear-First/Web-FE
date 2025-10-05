export type QualityStatus = "합격" | "보류" | "불합격";

export interface ReceivingRecord {
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

export interface InventorySnapshot {
  materialCode: string;
  materialName: string;
  onHand: number;
  unit: string;
  safetyStock: number;
  location: string;
  lastUpdated: string;
}

export interface InventoryItem {
  id: number;
  inventoryName: string;
  inventoryCode: string;
  currentStock: number;
  availableStock: number;
  warehouse: string;
  inboundDate: Date;
  inventoryStatus: string;
}

export type IssuanceStatus = "대기" | "진행중" | "완료";

export interface IssuanceRecord {
  id: string;
  inventoryCode: string;
  inventoryName: string;
  quantity: number;
  issuedDate: string;
  workOrderCode: string;
  destination: string;
  handledBy: string;
  status: IssuanceStatus;
}

export interface IssuanceSchedule {
  workOrder: string;
  inventoryName: string;
  requiredDate: string;
  preparedQuantity: number;
  status: "준비완료" | "자재부족";
}
