import { useMemo, useState } from "react";
import type {
  IssuanceRecord,
  IssuanceStatus,
  IssuanceSchedule,
} from "../models/erp";

const ISSUEANCE_RECORDS: IssuanceRecord[] = [
  {
    id: "ISS-240920-01",
    inventoryCode: "MAT-WIR-550",
    inventoryName: "고전압 케이블",
    quantity: 100,
    issuedDate: "2024-09-20",
    workOrderCode: "WO-240920-01",
    destination: "생산 라인 1",
    handledBy: "권오윤",
    status: "완료",
  },
  {
    id: "ISS-240920-02",
    inventoryCode: "MAT-BLT-200",
    inventoryName: "볼트 세트",
    quantity: 500,
    issuedDate: "2024-09-20",
    workOrderCode: "WO-240920-02",
    destination: "생산 라인 2",
    handledBy: "김민수",
    status: "대기",
  },
  {
    id: "ISS-240921-01",
    inventoryCode: "MAT-STL-110",
    inventoryName: "강철 판넬",
    quantity: 40,
    issuedDate: "2024-09-21",
    workOrderCode: "WO-240921-01",
    destination: "조립 공정",
    handledBy: "이서연",
    status: "진행중",
  },
  {
    id: "ISS-240921-02",
    inventoryCode: "MAT-BRD-310",
    inventoryName: "회로 기판",
    quantity: 200,
    issuedDate: "2024-09-21",
    workOrderCode: "WO-240921-02",
    destination: "전자부품 조립",
    handledBy: "박지훈",
    status: "완료",
  },
  {
    id: "ISS-240922-01",
    inventoryCode: "MAT-PLS-120",
    inventoryName: "플라스틱 케이스",
    quantity: 150,
    issuedDate: "2024-09-22",
    workOrderCode: "WO-240922-01",
    destination: "외장 조립",
    handledBy: "최유진",
    status: "대기",
  },
  {
    id: "ISS-240922-02",
    inventoryCode: "MAT-MTR-400",
    inventoryName: "소형 모터",
    quantity: 30,
    issuedDate: "2024-09-22",
    workOrderCode: "WO-240922-02",
    destination: "구동부 조립",
    handledBy: "정도현",
    status: "진행중",
  },
  {
    id: "ISS-240923-01",
    inventoryCode: "MAT-SNS-220",
    inventoryName: "온도 센서",
    quantity: 75,
    issuedDate: "2024-09-23",
    workOrderCode: "WO-240923-01",
    destination: "품질 관리",
    handledBy: "한지민",
    status: "완료",
  },
  {
    id: "ISS-240923-02",
    inventoryCode: "MAT-ALM-330",
    inventoryName: "알루미늄 프레임",
    quantity: 60,
    issuedDate: "2024-09-23",
    workOrderCode: "WO-240923-02",
    destination: "차체 조립",
    handledBy: "장도윤",
    status: "진행중",
  },
  {
    id: "ISS-240924-01",
    inventoryCode: "MAT-BAT-900",
    inventoryName: "리튬 배터리 팩",
    quantity: 20,
    issuedDate: "2024-09-24",
    workOrderCode: "WO-240924-01",
    destination: "전원부 조립",
    handledBy: "서하늘",
    status: "대기",
  },
  {
    id: "ISS-240924-02",
    inventoryCode: "MAT-GLS-700",
    inventoryName: "강화 유리 패널",
    quantity: 45,
    issuedDate: "2024-09-24",
    workOrderCode: "WO-240924-02",
    destination: "외관 마감",
    handledBy: "오승현",
    status: "완료",
  },
  {
    id: "ISS-240925-01",
    inventoryCode: "MAT-CBL-800",
    inventoryName: "데이터 케이블",
    quantity: 120,
    issuedDate: "2024-09-25",
    workOrderCode: "WO-240925-01",
    destination: "신호 배선",
    handledBy: "김지아",
    status: "진행중",
  },
];

const ISSUANCE_SCHEDULE: IssuanceSchedule[] = [
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

type StatusFilter = IssuanceStatus | "ALL";

export const useIssuanceViewModel = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filteredRecords = useMemo(() => {
    return ISSUEANCE_RECORDS.filter((record) => {
      return statusFilter === "ALL" || record.status === statusFilter;
    });
  }, [statusFilter]);

  const statusOptions: StatusFilter[] = ["ALL", "대기", "진행중", "완료"];

  return {
    statusOptions,
    statusFilter,
    setStatusFilter,
    filteredRecords,
    schedule: ISSUANCE_SCHEDULE,
  };
};
