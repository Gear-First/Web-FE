import type { InventoryRecord } from "./InventoryTypes";

// --- query keys ---
export const inventoryKeys = {
  records: ["inventory", "records"] as const,
};

export const mockRecords: InventoryRecord[] = [
  {
    warehouseId: "WH001",
    inventoryCode: "P001",
    inventoryName: "모터",
    inventoryQuantity: 120,
  },
  {
    warehouseId: "WH001",
    inventoryCode: "P002",
    inventoryName: "센서 모듈",
    inventoryQuantity: 80,
  },
  {
    warehouseId: "WH002",
    inventoryCode: "P003",
    inventoryName: "컨트롤 보드",
    inventoryQuantity: 45,
  },
  {
    warehouseId: "WH002",
    inventoryCode: "P004",
    inventoryName: "커넥터 케이블",
    inventoryQuantity: 200,
  },
  {
    warehouseId: "WH003",
    inventoryCode: "P005",
    inventoryName: "냉각팬",
    inventoryQuantity: 67,
  },
  {
    warehouseId: "WH003",
    inventoryCode: "P006",
    inventoryName: "PCB 보드",
    inventoryQuantity: 32,
  },
  {
    warehouseId: "WH004",
    inventoryCode: "P007",
    inventoryName: "볼트 세트",
    inventoryQuantity: 500,
  },
  {
    warehouseId: "WH004",
    inventoryCode: "P008",
    inventoryName: "고무 패킹",
    inventoryQuantity: 150,
  },
  {
    warehouseId: "WH005",
    inventoryCode: "P009",
    inventoryName: "히터 코일",
    inventoryQuantity: 22,
  },
  {
    warehouseId: "WH005",
    inventoryCode: "P010",
    inventoryName: "플라스틱 커버",
    inventoryQuantity: 91,
  },
  {
    warehouseId: "WH006",
    inventoryCode: "P011",
    inventoryName: "릴레이 모듈",
    inventoryQuantity: 76,
  },
  {
    warehouseId: "WH006",
    inventoryCode: "P012",
    inventoryName: "터치패드",
    inventoryQuantity: 13,
  },
  {
    warehouseId: "WH007",
    inventoryCode: "P013",
    inventoryName: "전원 어댑터",
    inventoryQuantity: 60,
  },
  {
    warehouseId: "WH007",
    inventoryCode: "P014",
    inventoryName: "기어 세트",
    inventoryQuantity: 120,
  },
  {
    warehouseId: "WH008",
    inventoryCode: "P015",
    inventoryName: "베어링",
    inventoryQuantity: 340,
  },
  {
    warehouseId: "WH008",
    inventoryCode: "P016",
    inventoryName: "LED 모듈",
    inventoryQuantity: 27,
  },
  {
    warehouseId: "WH009",
    inventoryCode: "P017",
    inventoryName: "배선 하네스",
    inventoryQuantity: 54,
  },
  {
    warehouseId: "WH009",
    inventoryCode: "P018",
    inventoryName: "히트 싱크",
    inventoryQuantity: 43,
  },
  {
    warehouseId: "WH010",
    inventoryCode: "P019",
    inventoryName: "케이블 타이",
    inventoryQuantity: 230,
  },
  {
    warehouseId: "WH010",
    inventoryCode: "P020",
    inventoryName: "안전 퓨즈",
    inventoryQuantity: 115,
  },
  {
    warehouseId: "WH011",
    inventoryCode: "P021",
    inventoryName: "로터",
    inventoryQuantity: 37,
  },
  {
    warehouseId: "WH011",
    inventoryCode: "P022",
    inventoryName: "스프링",
    inventoryQuantity: 88,
  },
  {
    warehouseId: "WH012",
    inventoryCode: "P023",
    inventoryName: "기판 클램프",
    inventoryQuantity: 42,
  },
  {
    warehouseId: "WH012",
    inventoryCode: "P024",
    inventoryName: "배터리 팩",
    inventoryQuantity: 19,
  },
  {
    warehouseId: "WH013",
    inventoryCode: "P025",
    inventoryName: "에어 필터",
    inventoryQuantity: 75,
  },
  {
    warehouseId: "WH013",
    inventoryCode: "P026",
    inventoryName: "패널 커버",
    inventoryQuantity: 33,
  },
  {
    warehouseId: "WH014",
    inventoryCode: "P027",
    inventoryName: "실링 고무",
    inventoryQuantity: 140,
  },
  {
    warehouseId: "WH014",
    inventoryCode: "P028",
    inventoryName: "히트 파이프",
    inventoryQuantity: 24,
  },
  {
    warehouseId: "WH015",
    inventoryCode: "P029",
    inventoryName: "컨트롤 스위치",
    inventoryQuantity: 58,
  },
  {
    warehouseId: "WH015",
    inventoryCode: "P030",
    inventoryName: "온도 센서",
    inventoryQuantity: 41,
  },
];

// --- API 함수 ---
export async function fetchInventoryRecords(): Promise<InventoryRecord[]> {
  // return (await axios.get("/api/outbound/records")).data;
  return mockRecords;
}
