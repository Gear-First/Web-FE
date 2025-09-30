import { useMemo, useState } from "react";
import type {
  InventorySnapshot,
  QualityStatus,
  ReceivingRecord,
} from "../models/erp";

const RECEIVING_RECORDS: ReceivingRecord[] = [
  {
    id: "RCV-240920-01",
    purchaseOrderId: "PO-240915-01",
    materialCode: "MAT-WIR-550",
    materialName: "고전압 케이블",
    quantityReceived: 520,
    unit: "EA",
    receivedDate: "2024-09-20",
    storageLocation: "창고 A",
    qualityStatus: "합격",
    inspector: "권오윤",
    lotNumber: "LOT-202409-012",
  },
  {
    id: "RCV-240920-02",
    purchaseOrderId: "PO-240915-01",
    materialCode: "MAT-WIR-550",
    materialName: "고전압 케이블",
    quantityReceived: 480,
    unit: "EA",
    receivedDate: "2024-09-20",
    storageLocation: "창고 A",
    qualityStatus: "보류",
    inspector: "추창우",
    lotNumber: "LOT-202409-032",
  },
  {
    id: "RCV-240918-01",
    purchaseOrderId: "PO-240918-02",
    materialCode: "MAT-SNS-331",
    materialName: "ABS 센서",
    quantityReceived: 600,
    unit: "EA",
    receivedDate: "2024-09-18",
    storageLocation: "창고 B",
    qualityStatus: "합격",
    inspector: "최동진",
    lotNumber: "LOT-202409-111",
  },
  {
    id: "RCV-240915-03",
    purchaseOrderId: "PO-240910-03",
    materialCode: "MAT-BRK-120",
    materialName: "브레이크 패드",
    quantityReceived: 1000,
    unit: "EA",
    receivedDate: "2024-09-15",
    storageLocation: "창고 C",
    qualityStatus: "불합격",
    inspector: "곽태근",
    lotNumber: "LOT-202409-231",
  },
];

const INVENTORY_SNAPSHOT: InventorySnapshot[] = [
  {
    materialCode: "LOT-20250920-001",
    materialName: "고전압 케이블",
    onHand: 1980,
    unit: "m",
    safetyStock: 1500,
    location: "창고 A",
    lastUpdated: "2024-09-20",
  },
  {
    materialCode: "LOT-20250918-002",
    materialName: "ABS 센서",
    onHand: 1000,
    unit: "EA",
    safetyStock: 1200,
    location: "창고 B",
    lastUpdated: "2024-09-18",
  },
  {
    materialCode: "LOT-20250915-003",
    materialName: "브레이크 패드",
    onHand: 2200,
    unit: "EA",
    safetyStock: 1500,
    location: "창고 C",
    lastUpdated: "2024-09-15",
  },
];

type QualityFilter = QualityStatus | "ALL";

type LocationFilter = "ALL" | string;

export const useReceivingStorageViewModel = () => {
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>("ALL");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("ALL");

  const locationOptions = useMemo(() => {
    const locations = Array.from(
      new Set(RECEIVING_RECORDS.map((record) => record.storageLocation))
    );
    return ["ALL", ...locations];
  }, []);

  const filteredRecords = useMemo(() => {
    return RECEIVING_RECORDS.filter((record) => {
      const qualityMatch =
        qualityFilter === "ALL" || record.qualityStatus === qualityFilter;
      const locationMatch =
        locationFilter === "ALL" || record.storageLocation === locationFilter;
      return qualityMatch && locationMatch;
    });
  }, [qualityFilter, locationFilter]);

  const summary = useMemo(() => {
    const today = "2024-09-20";
    const todayReceipts = filteredRecords.filter(
      (record) => record.receivedDate === today
    ).length;
    const qualityHold = filteredRecords.filter(
      (record) => record.qualityStatus === "보류"
    ).length;
    const totalOnHand = INVENTORY_SNAPSHOT.reduce(
      (acc, snapshot) => acc + snapshot.onHand,
      0
    );

    return {
      todayReceipts,
      qualityHold,
      totalOnHand,
    };
  }, [filteredRecords]);

  return {
    locationOptions,
    qualityFilter,
    setQualityFilter,
    locationFilter,
    setLocationFilter,
    filteredRecords,
    inventorySnapshot: INVENTORY_SNAPSHOT,
    summary,
  };
};
