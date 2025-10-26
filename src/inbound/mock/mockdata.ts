import type { InboundRecord } from "../InboundTypes";
import { generateInboundMock } from "./generateInboundMock";

export const mockdata: InboundRecord[] = generateInboundMock(1000, 20251026);
