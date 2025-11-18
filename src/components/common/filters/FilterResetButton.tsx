import type { ButtonHTMLAttributes, FC } from "react";
import Button from "../Button";
import resetIcon from "../../../assets/reset.svg";

interface FilterResetButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  label?: string;
}

const FilterResetButton: FC<FilterResetButtonProps> = ({
  label = "필터 초기화",
  ...rest
}) => {
  return (
    <Button variant="icon" aria-label={label} title={label} {...rest}>
      <img src={resetIcon} width={18} height={18} alt={label} />
    </Button>
  );
};

export default FilterResetButton;
