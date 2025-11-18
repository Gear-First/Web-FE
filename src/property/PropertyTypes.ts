export interface PropertyRecord {
  id?: number | string;
  warehouseCode: string;
  warehouseId?: string;
  supplierName?: string;
  onHandQty?: number;
  partQuantity?: number;
  partPrice?: number;
  price?: number;
  priceTotal?: number;
  updatedAt?: string;
  lastUpdatedAt?: string;
  partCode?: string;
  partName?: string;
  part?: PropertyItem;
}

export interface PropertyItem {
  id: number;
  code: string;
  name: string;
}

export interface PropertyResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    items: PropertyRecord[];
    page: number;
    size: number;
    total: number;
  };
}
