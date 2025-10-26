// src/mocks/handlers.ts
import { bomHandlers } from "../bom/mock/handlers";
import { handlers as inboundHandlers } from "../inbound/mock/handlers";

export const handlers = [...inboundHandlers, ...bomHandlers];
