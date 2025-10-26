import styled from "styled-components";

interface Props {
  keyword: string;
  onKeywordChange: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
  placeholder?: string;
}

export default function SearchBox({
  keyword,
  onKeywordChange,
  onSearch,
  placeholder = "검색어를 입력하세요",
}: Props) {
  return (
    <Wrapper>
      <Input
        type="text"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSearch();
          }
        }}
        placeholder={placeholder}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  font-size: 0.9rem;
  width: 200px;
`;
