export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}
export interface ApiResponseNoData {
  status: number;
  success: boolean;
  message: string;
}

export type ApiPage<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ListResponse<T> = {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export const BASE_URL = "http://34.120.215.23";
export const WAREHOUSE_BASE_PATH = `${BASE_URL}/warehouse/api/v1`;
export const INVENTORY_BASE_PATH = `${BASE_URL}/inventory/api/v1`;
export const USER_BASE_PATH = `${BASE_URL}/user/api/v1`;

export const WAREHOUSE_ENDPOINTS = {
  PARTS_LIST: `${WAREHOUSE_BASE_PATH}/parts`,
  PART_CATEGORIES: `${WAREHOUSE_BASE_PATH}/parts/categories`,
  INBOUND_LIST: `${WAREHOUSE_BASE_PATH}/receiving`,
};

export const INVENTORY_ENDPOINTS = {
  MATERIALS_LIST: `${INVENTORY_BASE_PATH}`,
  BOM_LIST: `${INVENTORY_BASE_PATH}`,
};
