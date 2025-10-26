import { setupWorker } from "msw/browser";
import { handlers } from "../inbound/mock/handlers";
import { inventoryHandlers } from "../inventory/mock/handlers";

export const worker = setupWorker(...handlers, ...inventoryHandlers);
