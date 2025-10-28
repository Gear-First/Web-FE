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

export const WAREHOUSE_ENDPOINTS = {
  PARTS_LIST: `${WAREHOUSE_BASE_PATH}/parts`,
};
