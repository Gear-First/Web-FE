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

export type OrderPriority = "높음" | "보통" | "낮음";
export type OrderStatus = "요청" | "협상중" | "발주완료";

export default interface ProcurementRequest {
  id: string;
  materialCode: string;
  materialName: string;
  requestedQty: number;
  unit: string;
  requester: string;
  department: string;
  requestedDate: string;
  priority: OrderPriority;
  status: OrderStatus;
  targetDate: string;
  selectedVendor?: string;
}

export interface VendorQuote {
  requestId: string;
  vendorName: string;
  pricePerUnit: number;
  leadTimeDays: number;
  validity: string;
}

export type PurchaseOrderStatus = "작성중" | "발주" | "입고완료";

export interface PurchaseOrder {
  id: string;
  vendorName: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  status: PurchaseOrderStatus;
  requestId: string;
}
