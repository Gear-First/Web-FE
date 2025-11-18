import type { PropertyRecord } from "../PropertyTypes";
import { generatePropertyMock } from "./generatePropertyMock";

export const mockdata: PropertyRecord[] = [
  ...generatePropertyMock(1000, 20251026), // 개수/seed 마음대로
];
