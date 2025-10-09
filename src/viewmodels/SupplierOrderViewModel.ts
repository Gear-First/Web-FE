import { useMemo, useState } from "react";
import type ProcurementRequest, {
  OrderPriority,
  OrderStatus,
  PurchaseOrder,
} from "../models/erp";

const PROCUREMENT_REQUESTS: ProcurementRequest[] = [
  {
    id: "PR-240910-01",
    materialCode: "MAT-BAT-001",
    materialName: "배터리 셀 (NCM)",
    requestedQty: 8000,
    unit: "EA",
    requester: "김민수",
    department: "생산기획팀",
    requestedDate: "2024-09-10",
    priority: "높음",
    status: "협상중",
    targetDate: "2024-09-28",
    selectedVendor: "SK 온",
  },
  {
    id: "PR-240912-02",
    materialCode: "MAT-SNS-331",
    materialName: "ABS 센서",
    requestedQty: 1200,
    unit: "EA",
    requester: "이지은",
    department: "품질보증팀",
    requestedDate: "2024-09-12",
    priority: "보통",
    status: "요청",
    targetDate: "2024-10-05",
  },
  {
    id: "PR-240915-03",
    materialCode: "MAT-WIR-550",
    materialName: "고전압 케이블",
    requestedQty: 1500,
    unit: "m",
    requester: "최준호",
    department: "구매팀",
    requestedDate: "2024-09-15",
    priority: "높음",
    status: "발주완료",
    targetDate: "2024-10-02",
    selectedVendor: "LS 전선",
  },
];

const VENDOR_QUOTES: VendorQuote[] = [
  {
    requestId: "PR-240910-01",
    vendorName: "SK 온",
    pricePerUnit: 54000,
    leadTimeDays: 12,
    validity: "2024-09-25",
  },
  {
    requestId: "PR-240910-01",
    vendorName: "LG 에너지솔루션",
    pricePerUnit: 55800,
    leadTimeDays: 10,
    validity: "2024-09-22",
  },
  {
    requestId: "PR-240912-02",
    vendorName: "한화 모션",
    pricePerUnit: 128000,
    leadTimeDays: 15,
    validity: "2024-09-30",
  },
];

const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-240915-01",
    vendorName: "LS 전선",
    orderDate: "2024-09-15",
    expectedDate: "2024-10-02",
    totalAmount: 128000000,
    status: "발주",
    requestId: "PR-240915-03",
  },
  {
    id: "PO-240918-02",
    vendorName: "현대 모비스",
    orderDate: "2024-09-18",
    expectedDate: "2024-10-04",
    totalAmount: 45750000,
    status: "작성중",
    requestId: "PR-240912-02",
  },
];

type StatusFilter = OrderStatus | "ALL";
type PriorityFilter = OrderPriority | "ALL";

export const useSupplierOrderViewModel = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");

  const filteredRequests = useMemo(() => {
    return PROCUREMENT_REQUESTS.filter((order) => {
      const statusMatch =
        statusFilter === "ALL" || order.status === statusFilter;
      const priorityMatch =
        priorityFilter === "ALL" || order.priority === priorityFilter;
      return statusMatch && priorityMatch;
    });
  }, [statusFilter, priorityFilter]);

  const quotesByRequest = useMemo(() => {
    return filteredRequests.reduce<Record<string, VendorQuote[]>>(
      (acc, request) => {
        acc[request.id] = VENDOR_QUOTES.filter(
          (quote) => quote.requestId === request.id
        );
        return acc;
      },
      {}
    );
  }, [filteredRequests]);

  const purchaseOrdersByRequest = useMemo(() => {
    return filteredRequests.reduce<Record<string, PurchaseOrder | undefined>>(
      (acc, request) => {
        acc[request.id] = PURCHASE_ORDERS.find(
          (order) => order.requestId === request.id
        );
        return acc;
      },
      {}
    );
  }, [filteredRequests]);

  const statusOptions: StatusFilter[] = ["ALL", "요청", "협상중", "발주완료"];
  const priorityOptions: PriorityFilter[] = ["ALL", "높음", "보통", "낮음"];

  return {
    statusOptions,
    priorityOptions,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    filteredRequests,
    quotesByRequest,
    purchaseOrdersByRequest,
  };
};
