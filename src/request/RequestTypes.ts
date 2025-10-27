export type RequestStatus = "미승인" | "승인" | "반려";

export interface PartItem {
  partCode: string; // 부품코드
  partName: string; // 부품명
  requestQuantity: number; // 수량
}

export interface RequestRecord {
  requestId: string; // 발주번호
  requestDate: string; // 요청일시
  agency: string; // 대리점
  agencyLocation: string; // 대리점위치
  manager: string; // 담당자
  managerPosition: string; // 담당자직책
  managerContact: string; // 담당자연락처
  submissionDate: string; // 접수일시
  status: RequestStatus; // 상태
  remarks: string; // 비고
  partItems: PartItem[]; // 여러 부품 묶음
}
