import { httpClient } from "./api";
import { InventoryItem } from "../../models/erp";

export const getInventories = async (): Promise<InventoryItem[]> => {
  const response = await httpClient<{
    status: number;
    success: boolean;
    message: string;
    data: InventoryItem[];
  }>("/inventory", { method: "GET" });

  return response.data; // data 배열만 반환
};
