export type CarModelRecord = {
  id: number;
  name: string;
  enabled: boolean;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PartCarModelMapping = {
  partId: number;
  carModelId: number;
  carModelName: string;
  enabled: boolean;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CarModelPartRecord = {
  id: number;
  code: string;
  name: string;
  category?: {
    id?: number | null;
    name?: string | null;
  };
};

export type PartCarModelCreateDTO = {
  carModelId: number;
  note?: string;
  enabled?: boolean;
};

export type PartCarModelUpdateDTO = {
  note?: string;
  enabled?: boolean;
};

export type CarModelCreateDTO = {
  name: string;
  enabled: boolean;
};

/* ======================= server models ======================= */

export type ServerCarModel = {
  id?: number;
  name?: string;
  enabled?: boolean;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ServerPartCarModel = {
  id?: number;
  carModelId?: number;
  carModelName?: string;
  name?: string;
  partId?: number;
  enabled?: boolean;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ServerCarModelPart = {
  id?: number;
  code?: string;
  name?: string;
  partId?: number;
  partCode?: string;
  partName?: string;
  category?: {
    id?: number | null;
    name?: string | null;
  } | null;
};

export type ServerPage<T> = {
  items?: T[];
  content?: T[];
  page?: number;
  size?: number;
  total?: number;
  totalElements?: number;
  totalPages?: number;
};

export function toCarModelRecord(server: ServerCarModel): CarModelRecord {
  return {
    id: server.id ?? 0,
    name: server.name ?? "-",
    enabled: server.enabled ?? true,
    note: server.note,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
  };
}

export function toPartCarModelMapping(
  server: ServerPartCarModel,
  fallbackPartId?: number
): PartCarModelMapping {
  return {
    partId: server.partId ?? fallbackPartId ?? 0,
    carModelId: server.carModelId ?? server.id ?? 0,
    carModelName: server.carModelName ?? server.name ?? "-",
    enabled: server.enabled ?? true,
    note: server.note,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
  };
}

export function toCarModelPartRecord(
  server: ServerCarModelPart
): CarModelPartRecord {
  return {
    id: server.partId ?? server.id ?? 0,
    code: server.partCode ?? server.code ?? "-",
    name: server.partName ?? server.name ?? "-",
    category: server.category ?? undefined,
  };
}
