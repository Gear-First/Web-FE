// src/mocks/handlers.ts
import { bomHandlers } from "../bom/mock/handlers";
import { handlers as inboundHandlers } from "../inbound/mock/handlers";
import { inventoryHandlers } from "../inventory/mock/handlers";
import { propertyHandlers } from "../property/mock/handlers";

export const handlers = [
  ...inboundHandlers,
  ...bomHandlers,
  ...inventoryHandlers,
  ...propertyHandlers,
];
