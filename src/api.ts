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

export const BASE_URL = "https://gearfirst-auth.duckdns.org";
export const WAREHOUSE_BASE_PATH = `${BASE_URL}/warehouse/api/v1`;
export const INVENTORY_BASE_PATH = `${BASE_URL}/inventory/api/v1`;
export const USER_BASE_PATH = `${BASE_URL}/user/api/v1`;
export const AUTH_BASE_PATH = `${BASE_URL}/auth/api/v1`;
export const ORDER_BASE_PATH = `${BASE_URL}/order/api/v1`;

export const WAREHOUSE_ENDPOINTS = {
  PARTS_LIST: `${WAREHOUSE_BASE_PATH}/parts`,
  PARTS_INTEGRATED: `${WAREHOUSE_BASE_PATH}/parts/integrated`,
  PART_CATEGORIES: `${WAREHOUSE_BASE_PATH}/parts/categories`,
  INBOUND_LIST: `${WAREHOUSE_BASE_PATH}/receiving`,
  OUTBOUND_LIST: `${WAREHOUSE_BASE_PATH}/shipping`,
};

export const INVENTORY_ENDPOINTS = {
  MATERIALS_LIST: `${INVENTORY_BASE_PATH}`,
  BOM_LIST: `${INVENTORY_BASE_PATH}`,
};

export const AUTH_ENDPOINTS = {
  SIGN_UP: `${USER_BASE_PATH}/registerUser`,
  CHANGE_PASSWORD: `${AUTH_BASE_PATH}/auth/change-password`,
};
