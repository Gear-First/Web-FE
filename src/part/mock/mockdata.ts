import type { PartRecord } from "../PartTypes";
import { generatePartMock } from "./generatePartMock";

export const mockdata: PartRecord[] = [
  ...generatePartMock(1000, 20251026), // 개수/seed 마음대로
];
