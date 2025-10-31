// usePartSearch.ts
import { useMemo } from "react";
import { useQuery, type PlaceholderDataFunction } from "@tanstack/react-query";
import { fetchPartRecords, partKeys, type PartListParams } from "../PartApi";
import type { ListResponse } from "../../../api";
import type { PartRecord } from "../PartTypes";

type Params = PartListParams & {
  page: number;
  pageSize: number;
};

function buildPartQueryKey(params: Params) {
  return [
    ...partKeys.records,
    params.q ?? "",
    params.searchBy ?? "auto",
    params.categoryId ?? "",
    params.page ?? 1,
    params.pageSize ?? 10,
    params.sort ? JSON.stringify(params.sort) : "",
  ] as const;
}

export type PartQueryKey = ReturnType<typeof buildPartQueryKey>;

type UsePartSearchOptions = {
  params: Params;
  enabled?: boolean;
  placeholderData?:
    | ListResponse<PartRecord[]>
    | PlaceholderDataFunction<
        ListResponse<PartRecord[]>,
        Error,
        ListResponse<PartRecord[]>,
        PartQueryKey
      >;
};

export function usePartSearch({
  params,
  enabled = true,
  placeholderData,
}: UsePartSearchOptions) {
  const queryKey = useMemo(() => buildPartQueryKey(params), [params]);

  return useQuery<
    ListResponse<PartRecord[]>,
    Error,
    ListResponse<PartRecord[]>,
    PartQueryKey
  >({
    queryKey,
    queryFn: () => fetchPartRecords(params),
    enabled,
    placeholderData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
