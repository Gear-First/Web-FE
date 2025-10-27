import styled from "styled-components";

/* 모달 전체 배경 */
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

/* 모달 컨테이너 */
export const ModalContainer = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 1000px;
  max-width: 95%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
  position: relative;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

/* 모달 상단 헤더 */
export const Header = styled.header`
  background: #f3f5f8;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/* 제목 + 상태 뱃지 묶음 (왼쪽 영역) */
export const HeaderLeft = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

/* 모달 제목 */
export const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

/* 닫기 버튼 (X) */
export const CloseButton = styled.button`
  border: none;
  background: transparent;
  font-size: 1.4rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #111827;
    transform: scale(1.2);
  }
`;

/* 각 섹션 */
export const Section = styled.section`
  padding: 1.5rem 1.8rem;
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

/* 섹션 제목 */
export const SectionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem;
  border-left: 4px solid #2563eb;
  padding-left: 0.5rem;
`;

type DetailGridProps = { $cols?: number };

/* 상세 정보 그리드 */
export const DetailGrid = styled.div<DetailGridProps>`
  display: grid;
  grid-template-columns: repeat(${({ $cols = 3 }) => $cols}, 1fr);
  gap: 0.8rem 1.5rem;
`;

/* 각 항목의 묶음 (Label + Value) */
export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

/* 항목 이름 (예: 담당자, 부품코드 등) */
export const Label = styled.span`
  font-size: 0.78rem;
  color: #6b7280;
`;

/* 항목 값 */
export const Value = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
  margin-top: 2px;
`;

/* 부품 리스트 */
export const InventoryList = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
  padding: 0.5rem;
  margin-top: 8px;
  max-height: 64px;
  overflow-y: scroll;
`;

/* 비고 영역 (텍스트가 길 경우 내부 스크롤) */
export const RemarkSection = styled(Section)`
  max-height: 120px; /* 원하는 높이로 조절 */
  overflow-y: auto;
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
`;

/* 비고 입력 래퍼 */
export const TextareaWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

/* 비고 입력 텍스트창 */
export const StyledTextarea = styled.textarea`
  width: 100%;
  height: 60px;
  border: 1px solid #d9d9d9;
  padding: 0.75rem;
  resize: none;
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;
`;

/* 버튼 */
export const Button = styled.button<{ color?: string }>`
  background-color: ${({ color }) => color || "#ccc"};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
