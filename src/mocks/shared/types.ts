export type ListResponse<T> = {
  data: T;
  meta?: { total: number; page: number; pageSize: number; totalPages: number };
};
