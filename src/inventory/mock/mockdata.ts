import type { InventoryRecord } from "../InventoryTypes";
import { generateInventoryMock } from "./generateInventoryMock";

export const mockdata: InventoryRecord[] = [
  ...generateInventoryMock(1000, 20251026), // 개수/seed 마음대로
];
