import styled, { css } from "styled-components";
import { Table } from "./PageLayout";

// 스크롤 컨테이너
export const TableScroll = styled.div<{ $maxHeight?: number | string }>`
  max-height: ${({ $maxHeight = 160 }) =>
    typeof $maxHeight === "number" ? `${$maxHeight}px` : $maxHeight};
  overflow: auto;
  border: 1px solid #edf1f5;

  /* 스크롤바 커스텀 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 8px;
  }
`;

// 스티키 테이블 (열·행 크기 제어 가능)
export const StickyTable = styled(Table)<{
  $stickyTop?: number;
  $headerBg?: string;
  $zebra?: boolean;
  $colWidths?: string[];
  $rowHeight?: number | string;
  $compact?: boolean;
}>`
  table-layout: fixed;
  width: 100%;

  thead th {
    position: sticky;
    top: ${({ $stickyTop = 0 }) => `${$stickyTop}px`};
    z-index: 1;
    background: ${({ $headerBg = "#fafbfc" }) => $headerBg};
  }

  ${({ $zebra = true }) =>
    $zebra &&
    css`
      tbody tr:nth-child(even) td {
        background: #fcfdff;
      }
    `}

  ${({ $colWidths }) =>
    $colWidths &&
    $colWidths
      .map(
        (width, i) => css`
          th:nth-child(${i + 1}),
          td:nth-child(${i + 1}) {
            width: ${width};
          }
        `
      )
      .reduce(
        (acc, cur) => css`
          ${acc}
          ${cur}
        `
      )}

  ${({ $rowHeight }) =>
    $rowHeight &&
    css`
      th,
      td {
        height: ${typeof $rowHeight === "number"
          ? `${$rowHeight}px`
          : $rowHeight};
        line-height: 1.4;
      }
    `}
  ${({ $compact }) =>
    $compact &&
    css`
      th,
      td {
        padding: 0.4rem 0;
        font-size: 0.8rem;
        line-height: 1.4;
        height: auto;
      }
      th {
        font-weight: 600;
      }
    `}
`;
// 편의용 래퍼 (선택)
export const ScrollStickyTable = styled(StickyTable)``;
