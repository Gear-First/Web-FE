import { useMemo } from "react";
import { useQuery, type PlaceholderDataFunction } from "@tanstack/react-query";
import {
  fetchCarModels,
  carModelKeys,
  type CarModelListParams,
} from "../CarModelApi";
import type { ListResponse } from "../../api";
import type { CarModelRecord } from "../CarModelTypes";

type Params = CarModelListParams & {
  page: number;
  pageSize: number;
};

function buildKey(params: Params) {
  return [
    ...carModelKeys.list("records"),
    params.q ?? "",
    params.enabled === undefined ? "all" : String(params.enabled),
    params.page,
    params.pageSize,
    params.sort ? JSON.stringify(params.sort) : "",
  ] as const;
}

export type CarModelQueryKey = ReturnType<typeof buildKey>;

type Options = {
  params: Params;
  enabled?: boolean;
  placeholderData?:
    | ListResponse<CarModelRecord[]>
    | PlaceholderDataFunction<
        ListResponse<CarModelRecord[]>,
        Error,
        ListResponse<CarModelRecord[]>,
        CarModelQueryKey
      >;
};

export function useCarModelSearch({
  params,
  enabled = true,
  placeholderData,
}: Options) {
  const queryKey = useMemo(() => buildKey(params), [params]);

  return useQuery<
    ListResponse<CarModelRecord[]>,
    Error,
    ListResponse<CarModelRecord[]>,
    CarModelQueryKey
  >({
    queryKey,
    queryFn: () => fetchCarModels(params),
    enabled,
    placeholderData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
