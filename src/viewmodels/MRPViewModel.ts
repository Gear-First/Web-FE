import { useMemo, useState } from "react";
import type { ProductionPlan } from "../models/erp";

const PLAN_DATA: ProductionPlan[] = [
  {
    id: "PLAN-001",
    productCode: "EV-AX-01",
    productName: "전기차 구동 모듈",
    plannedQuantity: 120,
    plannedStartDate: "2024-10-14",
    plannedEndDate: "2024-10-18",
  },
  {
    id: "PLAN-002",
    productCode: "EV-AX-01",
    productName: "전기차 구동 모듈",
    plannedQuantity: 140,
    plannedStartDate: "2024-10-20",
    plannedEndDate: "2024-10-25",
  },
  {
    id: "PLAN-003",
    productCode: "EV-BR-02",
    productName: "브레이크 어셈블리",
    plannedQuantity: 260,
    plannedStartDate: "2024-11-01",
    plannedEndDate: "2024-11-07",
  },
  {
    id: "PLAN-004",
    productCode: "EV-HV-07",
    productName: "고전압 배선 세트",
    plannedQuantity: 85,
    plannedStartDate: "2024-11-01",
    plannedEndDate: "2024-11-10",
  },
  {
    id: "PLAN-005",
    productCode: "EV-BR-02",
    productName: "브레이크 어셈블리",
    plannedQuantity: 240,
    plannedStartDate: "2024-11-01",
    plannedEndDate: "2024-11-19",
  },
];

export const useMRPViewModel = () => {
  const [selectedDate, setSelectedDate] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<string>("ALL");

  // 날짜 목록 추출 (시작일 기준)
  const dateOptions = useMemo(() => {
    const dates = Array.from(
      new Set(PLAN_DATA.map((plan) => plan.plannedStartDate))
    );
    return [{ value: "ALL", label: "전체 일정" }].concat(
      dates.map((date) => ({ value: date, label: date }))
    );
  }, []);

  const productOptions = useMemo(() => {
    const map = new Map<string, string>();
    PLAN_DATA.forEach((plan) => {
      map.set(plan.productCode, plan.productName);
    });
    return [{ value: "ALL", label: "전체 제품" }].concat(
      Array.from(map.entries()).map(([value, label]) => ({ value, label }))
    );
  }, []);

  const filteredPlans = useMemo(() => {
    return PLAN_DATA.filter((plan) => {
      const dateMatch =
        selectedDate === "ALL" || plan.plannedStartDate === selectedDate;
      const productMatch =
        selectedProduct === "ALL" || plan.productCode === selectedProduct;
      return dateMatch && productMatch;
    });
  }, [selectedDate, selectedProduct]);

  return {
    dateOptions,
    productOptions,
    selectedDate,
    setSelectedDate,
    selectedProduct,
    setSelectedProduct,
    filteredPlans,
  };
};
