import type { BOMRecord } from "../BOMTypes";
import { generateBOMMock } from "./generateBOMMock";

export const mockdata: BOMRecord[] = generateBOMMock(200, 20251027);
