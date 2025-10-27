// src/mocks/handlers.ts
import { bomHandlers } from "../bom/mock/handlers";
import { handlers as inboundHandlers } from "../inbound/mock/handlers";
import { partHandlers } from "../part/mock/handlers";
import { propertyHandlers } from "../property/mock/handlers";

export const handlers = [
  ...inboundHandlers,
  ...bomHandlers,
  ...partHandlers,
  ...propertyHandlers,
];
