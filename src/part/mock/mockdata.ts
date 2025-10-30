import type { InventoryPartRecord } from "../PartTypes";
import { generatePartMock } from "./generatePartMock";

export const mockdata: InventoryPartRecord[] = [
  ...generatePartMock(1000, 20251026), // 개수/seed 마음대로
];
