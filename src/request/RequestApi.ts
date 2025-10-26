import type { RequestRecord } from "./RequestTypes";

// React Query에서 사용할 쿼리 키 정의
export const requestKeys = {
  records: ["request", "records"] as const,
};

// 발주 요청 목데이터
export const requestRecords: RequestRecord[] = [
  {
    requestId: "REQ-251001-01",
    requestDate: "2025-10-01 09:30",
    agency: "서울자동차부품상사",
    agencyLocation: "서울특별시 강남구",
    manager: "김민수",
    managerPosition: "영업팀장",
    managerContact: "010-1234-5678",
    submissionDate: "2025-10-01 10:00",
    status: "승인",
    remarks: "긴급 발주",
    inventoryItems: [
      {
        inventoryCode: "ENG-101",
        inventoryName: "엔진블록",
        requestQuantity: 2,
      },
      {
        inventoryCode: "FLT-305",
        inventoryName: "오일필터",
        requestQuantity: 10,
      },
    ],
  },
  {
    requestId: "REQ-251001-02",
    requestDate: "2025-10-01 14:20",
    agency: "부산카서비스",
    agencyLocation: "부산광역시 해운대구",
    manager: "이수진",
    managerPosition: "대리",
    managerContact: "010-8765-4321",
    submissionDate: "2025-10-01 15:00",
    status: "미승인",
    remarks: "",
    inventoryItems: [
      {
        inventoryCode: "BRK-210",
        inventoryName: "브레이크패드",
        requestQuantity: 8,
      },
      {
        inventoryCode: "BRK-215",
        inventoryName: "브레이크디스크",
        requestQuantity: 4,
      },
      {
        inventoryCode: "BOL-101",
        inventoryName: "조립볼트세트",
        requestQuantity: 20,
      },
      {
        inventoryCode: "FLD-111",
        inventoryName: "스파크플러그",
        requestQuantity: 2,
      },
      {
        inventoryCode: "SPK-501",
        inventoryName: "냉각수호스",
        requestQuantity: 32,
      },
      {
        inventoryCode: "ENG-220",
        inventoryName: "연료펌프",
        requestQuantity: 3,
      },
    ],
  },
  {
    requestId: "REQ-251002-03",
    requestDate: "2025-10-02 09:00",
    agency: "대구모터스",
    agencyLocation: "대구광역시 북구",
    manager: "정다은",
    managerPosition: "매니저",
    managerContact: "010-2222-3333",
    submissionDate: "2025-10-02 09:40",
    status: "승인",
    remarks: "정기 발주",
    inventoryItems: [
      {
        inventoryCode: "SPK-501",
        inventoryName: "냉각수호스",
        requestQuantity: 30,
      },
      {
        inventoryCode: "BLT-401",
        inventoryName: "벨트세트",
        requestQuantity: 5,
      },
    ],
  },
  {
    requestId: "REQ-251002-04",
    requestDate: "2025-10-02 13:10",
    agency: "인천오토월드",
    agencyLocation: "인천광역시 미추홀구",
    manager: "박정훈",
    managerPosition: "부장",
    managerContact: "010-4444-5555",
    submissionDate: "2025-10-02 13:30",
    status: "반려",
    remarks: "재고 부족",
    inventoryItems: [
      {
        inventoryCode: "ENG-220",
        inventoryName: "연료펌프",
        requestQuantity: 3,
      },
      {
        inventoryCode: "FLD-111",
        inventoryName: "냉각수호스",
        requestQuantity: 12,
      },
    ],
  },
  {
    requestId: "REQ-251003-05",
    requestDate: "2025-10-03 11:40",
    agency: "광주모터샵",
    agencyLocation: "광주광역시 서구",
    manager: "최유진",
    managerPosition: "점장",
    managerContact: "010-9999-1111",
    submissionDate: "2025-10-03 12:10",
    status: "승인",
    remarks: "테스트용 부품 포함",
    inventoryItems: [
      {
        inventoryCode: "PST-112",
        inventoryName: "피스톤세트",
        requestQuantity: 4,
      },
      {
        inventoryCode: "CRK-301",
        inventoryName: "크랭크샤프트",
        requestQuantity: 1,
      },
    ],
  },
  {
    requestId: "REQ-251004-06",
    requestDate: "2025-10-04 10:00",
    agency: "울산오토하우스",
    agencyLocation: "울산광역시 남구",
    manager: "한지훈",
    managerPosition: "기술팀장",
    managerContact: "010-5555-7777",
    submissionDate: "2025-10-04 10:20",
    status: "미승인",
    remarks: "",
    inventoryItems: [
      {
        inventoryCode: "WTR-602",
        inventoryName: "워터펌프",
        requestQuantity: 2,
      },
      {
        inventoryCode: "RAD-701",
        inventoryName: "라디에이터",
        requestQuantity: 1,
      },
    ],
  },
  {
    requestId: "REQ-251004-07",
    requestDate: "2025-10-04 15:45",
    agency: "수원카테크",
    agencyLocation: "경기도 수원시",
    manager: "오지민",
    managerPosition: "과장",
    managerContact: "010-8888-9999",
    submissionDate: "2025-10-04 16:00",
    status: "승인",
    remarks: "정기 점검 부품",
    inventoryItems: [
      {
        inventoryCode: "AIR-202",
        inventoryName: "에어필터",
        requestQuantity: 15,
      },
      {
        inventoryCode: "OIL-203",
        inventoryName: "오일필터",
        requestQuantity: 15,
      },
      {
        inventoryCode: "CAB-204",
        inventoryName: "캐빈필터",
        requestQuantity: 10,
      },
    ],
  },
  {
    requestId: "REQ-251005-08",
    requestDate: "2025-10-05 09:20",
    agency: "창원모터스",
    agencyLocation: "경상남도 창원시",
    manager: "이하늘",
    managerPosition: "주임",
    managerContact: "010-1212-3434",
    submissionDate: "2025-10-05 09:50",
    status: "승인",
    remarks: "-",
    inventoryItems: [
      {
        inventoryCode: "SPK-501",
        inventoryName: "스파크플러그",
        requestQuantity: 20,
      },
    ],
  },
  {
    requestId: "REQ-251006-09",
    requestDate: "2025-10-06 13:25",
    agency: "평택자동차정비",
    agencyLocation: "경기도 평택시",
    manager: "문세린",
    managerPosition: "정비반장",
    managerContact: "010-7777-3333",
    submissionDate: "2025-10-06 13:45",
    status: "반려",
    remarks: "수량 과다",
    inventoryItems: [
      {
        inventoryCode: "BRK-215",
        inventoryName: "브레이크디스크",
        requestQuantity: 50,
      },
    ],
  },
  {
    requestId: "REQ-251006-10",
    requestDate: "2025-10-06 17:00",
    agency: "전주카시스템",
    agencyLocation: "전라북도 전주시",
    manager: "유성민",
    managerPosition: "기사",
    managerContact: "010-5555-2222",
    submissionDate: "2025-10-06 17:20",
    status: "미승인",
    remarks: "",
    inventoryItems: [
      {
        inventoryCode: "ENG-101",
        inventoryName: "엔진블록",
        requestQuantity: 1,
      },
      {
        inventoryCode: "PST-112",
        inventoryName: "피스톤세트",
        requestQuantity: 4,
      },
    ],
  },
];

// API 함수
export async function fetchRequestRecords(): Promise<RequestRecord[]> {
  // return (await axios.get("/api/request/records")).data;
  return requestRecords;
}
