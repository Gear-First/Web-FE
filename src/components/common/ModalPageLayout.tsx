import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

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

export const Header = styled.header`
  background: #f3f5f8;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderLeft = styled.header`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

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

export const Section = styled.section`
  padding: 1.5rem 1.8rem;
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

export const SectionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem;
  border-left: 4px solid #2563eb;
  padding-left: 0.5rem;
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem 1.5rem;
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.span`
  font-size: 0.78rem;
  color: #6b7280;
`;

export const Value = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
  margin-top: 2px;
`;

export const RemarkSection = styled(Section)`
  max-height: 120px; /* 원하는 높이로 조절 */
  overflow-y: auto;
  padding: 0.75rem;
  border: 1px solid #d9d9d9;
`;
