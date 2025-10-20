import { Table, Th, Td, StatusBadge } from "../../components/common/PageLayout";
import type { OutboundSchedule } from "../OutboundTypes";

const scheduleVariant = {
  준비완료: "success" as const,
  자재부족: "danger" as const,
};

export default function ScheduleTable({ rows }: { rows: OutboundSchedule[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>작업 지시</Th>
          <Th>제품</Th>
          <Th>필요 일자</Th>
          <Th>준비 자재 수</Th>
          <Th>상태</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((i) => (
          <tr key={i.workOrder}>
            <Td>{i.workOrder}</Td>
            <Td>{i.inventoryName}</Td>
            <Td>{i.requiredDate}</Td>
            <Td>{i.preparedQuantity}</Td>
            <Td>
              <StatusBadge $variant={scheduleVariant[i.status] ?? "info"}>
                {i.status}
              </StatusBadge>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
