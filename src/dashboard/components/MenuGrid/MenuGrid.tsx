import styled from "styled-components";
import MenuCard from "../MenuCard/MenuCard";
import type { MenuSummary } from "../../types/dashboard";

const MenuGridStyled = styled.div`
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

type MenuGridProps = {
  menuSummaries: MenuSummary[];
};

export default function MenuGrid({ menuSummaries }: MenuGridProps) {
  return (
    <MenuGridStyled>
      {menuSummaries.map((card) => (
        <MenuCard key={card.key} card={card} />
      ))}
    </MenuGridStyled>
  );
}

