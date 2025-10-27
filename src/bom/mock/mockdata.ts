import type { BOMRecord } from "../BOMTypes";
import type { PartRecords } from "../../items/parts/PartTypes";
import { generateBOMMock } from "./generateBOMMock";
import { generatePartMock } from "../../items/parts/generatePartMock";

export const mockdata: BOMRecord[] = generateBOMMock(200, 20251027);
export const PartMockdata: PartRecords[] = generatePartMock(200, 20251027);
