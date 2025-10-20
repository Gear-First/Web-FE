// 초기엔 목데이터로 시작하고, 서버 연동 시 fetch/axios로 교체하세요.
import type { IssuanceRecord, IssuanceSchedule } from "./IssuanceTypes";

// --- query keys (여기 한군데서 관리) ---
export const issuanceKeys = {
  records: ["issuance", "records"] as const,
  schedule: ["issuance", "schedule"] as const,
};

// --- mock (실서버 전환시 삭제/대체) ---
export const mockRecords: IssuanceRecord[] = [
  /* ...여기에 현재 제공한 데이터 붙여넣기... */
  {
    id: "ISS-240920-01",
    inventoryCode: "MAT-WIR-550",
    inventoryName: "고전압 케이블",
    quantity: 100,
    issuedDate: "2024-09-20",
    expectedDeliveryDate: "2024-09-23",
    receiptDate: "2024-09-22",
    destination: "생산 라인 1",
    handledBy: "권오윤",
    status: "완료",
    deliveryFactory: "창고 A",
  },
  {
    id: "ISS-240921-02",
    inventoryCode: "MAT-RES-120",
    inventoryName: "저항 120Ω",
    quantity: 500,
    issuedDate: "2024-09-21",
    expectedDeliveryDate: "2024-09-24",
    receiptDate: "2024-09-23",
    destination: "생산 라인 2",
    handledBy: "김지훈",
    status: "완료",
    deliveryFactory: "창고 B",
  },
  {
    id: "ISS-240922-03",
    inventoryCode: "MAT-CAP-330",
    inventoryName: "커패시터 330μF",
    quantity: 200,
    issuedDate: "2024-09-22",
    expectedDeliveryDate: "2024-09-25",
    receiptDate: "2024-09-24",
    destination: "생산 라인 3",
    handledBy: "박서연",
    status: "진행중",
    deliveryFactory: "창고 A",
  },
  {
    id: "ISS-240923-04",
    inventoryCode: "MAT-WIR-300",
    inventoryName: "저압 케이블",
    quantity: 150,
    issuedDate: "2024-09-23",
    expectedDeliveryDate: "2024-09-26",
    receiptDate: "2024-09-25",
    destination: "생산 라인 4",
    handledBy: "이도현",
    status: "대기",
    deliveryFactory: "창고 C",
  },
  {
    id: "ISS-240924-05",
    inventoryCode: "MAT-IC-101",
    inventoryName: "마이크로컨트롤러 IC",
    quantity: 50,
    issuedDate: "2024-09-24",
    expectedDeliveryDate: "2024-09-27",
    receiptDate: "2024-09-26",
    destination: "생산 라인 1",
    handledBy: "조민수",
    status: "완료",
    deliveryFactory: "창고 B",
  },
  {
    id: "ISS-240925-06",
    inventoryCode: "MAT-LED-5MM",
    inventoryName: "LED 5mm 빨강",
    quantity: 1000,
    issuedDate: "2024-09-25",
    expectedDeliveryDate: "2024-09-28",
    receiptDate: "2024-09-27",
    destination: "생산 라인 2",
    handledBy: "권오윤",
    status: "진행중",
    deliveryFactory: "창고 A",
  },
  {
    id: "ISS-240926-07",
    inventoryCode: "MAT-SW-01",
    inventoryName: "푸시 버튼 스위치",
    quantity: 300,
    issuedDate: "2024-09-26",
    expectedDeliveryDate: "2024-09-29",
    receiptDate: "2024-09-28",
    destination: "생산 라인 3",
    handledBy: "김지훈",
    status: "대기",
    deliveryFactory: "창고 C",
  },
  {
    id: "ISS-240927-08",
    inventoryCode: "MAT-FAN-12V",
    inventoryName: "12V 쿨링팬",
    quantity: 80,
    issuedDate: "2024-09-27",
    expectedDeliveryDate: "2024-09-30",
    receiptDate: "2024-09-29",
    destination: "생산 라인 4",
    handledBy: "박서연",
    status: "완료",
    deliveryFactory: "창고 B",
  },
  {
    id: "ISS-240928-09",
    inventoryCode: "MAT-MCU-201",
    inventoryName: "MCU 보드",
    quantity: 40,
    issuedDate: "2024-09-28",
    expectedDeliveryDate: "2024-10-01",
    receiptDate: "2024-09-30",
    destination: "생산 라인 1",
    handledBy: "이도현",
    status: "진행중",
    deliveryFactory: "창고 A",
  },
  {
    id: "ISS-240929-10",
    inventoryCode: "MAT-WIR-400",
    inventoryName: "고압 케이블",
    quantity: 120,
    issuedDate: "2024-09-29",
    expectedDeliveryDate: "2024-10-02",
    receiptDate: "2024-10-01",
    destination: "생산 라인 2",
    handledBy: "조민수",
    status: "대기",
    deliveryFactory: "창고 C",
  },
];
export const mockSchedule: IssuanceSchedule[] = [
  /* ...여기에 현재 제공한 데이터 붙여넣기... */
  {
    workOrder: "WO-240921-03",
    inventoryName: "데이터 케이블",
    requiredDate: "2024-09-21",
    preparedQuantity: 12,
    status: "준비완료",
  },
  {
    workOrder: "WO-240922-01",
    inventoryName: "알루미늄 프레임",
    requiredDate: "2024-09-22",
    preparedQuantity: 8,
    status: "자재부족",
  },
  {
    workOrder: "WO-240923-02",
    inventoryName: "강화 유리 패널",
    requiredDate: "2024-09-23",
    preparedQuantity: 10,
    status: "준비완료",
  },
  {
    workOrder: "WO-240924-01",
    inventoryName: "브레이크 패드",
    requiredDate: "2024-09-24",
    preparedQuantity: 6,
    status: "준비완료",
  },
  {
    workOrder: "WO-240924-02",
    inventoryName: "ABS 센서",
    requiredDate: "2024-09-24",
    preparedQuantity: 4,
    status: "자재부족",
  },
  {
    workOrder: "WO-240925-01",
    inventoryName: "리튬 배터리 팩",
    requiredDate: "2024-09-25",
    preparedQuantity: 14,
    status: "준비완료",
  },
  {
    workOrder: "WO-240926-01",
    inventoryName: "고전압 케이블",
    requiredDate: "2024-09-26",
    preparedQuantity: 11,
    status: "자재부족",
  },
  {
    workOrder: "WO-240927-01",
    inventoryName: "차량용 모터",
    requiredDate: "2024-09-27",
    preparedQuantity: 5,
    status: "준비완료",
  },
  {
    workOrder: "WO-240928-01",
    inventoryName: "전방 카메라 모듈",
    requiredDate: "2024-09-28",
    preparedQuantity: 7,
    status: "자재부족",
  },
  {
    workOrder: "WO-240929-01",
    inventoryName: "HUD 디스플레이",
    requiredDate: "2024-09-29",
    preparedQuantity: 9,
    status: "준비완료",
  },
  {
    workOrder: "WO-240930-01",
    inventoryName: "와이퍼 모터",
    requiredDate: "2024-09-30",
    preparedQuantity: 6,
    status: "자재부족",
  },
];

// --- API 함수 ---
export async function fetchIssuanceRecords(): Promise<IssuanceRecord[]> {
  // return (await axios.get("/api/issuance/records")).data;
  return mockRecords;
}

export async function fetchIssuanceSchedule(): Promise<IssuanceSchedule[]> {
  // return (await axios.get("/api/issuance/schedule")).data;
  return mockSchedule;
}
