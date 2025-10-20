export type OutboundStatus = "대기" | "진행중" | "완료";

export interface OutboundRecord {
  id: string;
  inventoryCode: string;
  inventoryName: string;
  quantity: number;
  issuedDate: string;
  expectedDeliveryDate: string;
  receiptDate: string;
  destination: string;
  handledBy: string;
  status: OutboundStatus;
  deliveryFactory: string;
}

export interface OutboundSchedule {
  workOrder: string;
  inventoryName: string;
  requiredDate: string;
  preparedQuantity: number;
  status: "준비완료" | "자재부족";
}
