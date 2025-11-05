// src/mocks/handlers.ts
import { bomHandlers } from "../bom/mock/handlers";
import { partHandlers as partsHandlers } from "../items/parts/mock/handlers";
import { handlers as inboundHandlers } from "../inbound/mock/handlers";
import { propertyHandlers } from "../property/mock/handlers";
import { materialHandlers } from "../items/materials/mock/handlers";

export const handlers = [
  ...inboundHandlers,
  ...bomHandlers,
  ...partsHandlers,
  ...materialHandlers,
  ...propertyHandlers,
];
