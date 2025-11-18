import { useMemo } from "react";
import { useQuery, type PlaceholderDataFunction } from "@tanstack/react-query";
import {
  fetchMaterialRecords,
  materialKeys,
  type MaterialListParams,
} from "../MaterialApi";
import type { ListResponse } from "../../../api";
import type { MaterialRecord } from "../MaterialTypes";

type Params = MaterialListParams & {
  page: number;
  pageSize: number;
};

function buildMaterialQueryKey(params: Params) {
  return [
    ...materialKeys.records,
    params.keyword ?? "",
    params.startDate ?? "",
    params.endDate ?? "",
    params.page ?? 1,
    params.pageSize ?? 10,
  ] as const;
}
export type MaterialQueryKey = ReturnType<typeof buildMaterialQueryKey>;

type UseMaterialSearchOptions = {
  params: Params;
  enabled?: boolean;
  placeholderData?:
    | ListResponse<MaterialRecord[]>
    | PlaceholderDataFunction<
        ListResponse<MaterialRecord[]>,
        Error,
        ListResponse<MaterialRecord[]>,
        MaterialQueryKey
      >;
};

export function useMaterialSearch({
  params,
  enabled = true,
  placeholderData,
}: UseMaterialSearchOptions) {
  const queryKey = useMemo(() => buildMaterialQueryKey(params), [params]);

  return useQuery<
    ListResponse<MaterialRecord[]>,
    Error,
    ListResponse<MaterialRecord[]>,
    MaterialQueryKey
  >({
    queryKey,
    queryFn: () => fetchMaterialRecords(params),
    enabled,
    placeholderData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
