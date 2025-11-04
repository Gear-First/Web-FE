import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsers,
  getRegion,
  getWorkType,
  userKeys,
  type UserListParams,
} from "../HumanApi";
import type { ListResponse } from "../../api";
import type { UserRecord } from "../HumanTypes";
import { useMemo } from "react";

export const regionKey = ["region", "list"] as const;
export const workTypeKey = ["workType", "list"] as const;

export function useUsers(params: UserListParams) {
  const queryKey = useMemo(() => [...userKeys.list, params], [params]);
  return useQuery<ListResponse<UserRecord[]>, Error>({
    queryKey,
    queryFn: () => fetchUsers(params),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

export function useRegions(enabled = true) {
  return useQuery({
    queryKey: regionKey,
    queryFn: getRegion,
    staleTime: 10 * 60 * 1000,
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useWorkTypes(enabled = true) {
  return useQuery({
    queryKey: workTypeKey,
    queryFn: getWorkType,
    staleTime: 10 * 60 * 1000,
    enabled,
    placeholderData: (prev) => prev,
  });
}

export async function prefetchHumanLookups(
  qc: ReturnType<typeof useQueryClient>
) {
  await Promise.all([
    qc.prefetchQuery({
      queryKey: regionKey,
      queryFn: getRegion,
      staleTime: 10 * 60 * 1000,
    }),
    qc.prefetchQuery({
      queryKey: workTypeKey,
      queryFn: getWorkType,
      staleTime: 10 * 60 * 1000,
    }),
  ]);
}
