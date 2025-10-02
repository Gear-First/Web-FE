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

export type ShippingStatus = "대기" | "진행중" | "완료";

export interface ShippingRecord {
  id: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  issuedDate: string;
  destination: string;
  workOrder: string;
  handledBy: string;
  status: ShippingStatus;
}

export interface ShippingSchedule {
  workOrder: string;
  productName: string;
  requiredBy: string;
  totalMaterials: number;
  status: "준비완료" | "자재부족";
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
