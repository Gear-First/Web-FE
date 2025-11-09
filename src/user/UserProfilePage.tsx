import { useEffect, useState } from "react";
import styled from "styled-components";
import { getUser, changePassword } from "./UserApi";
import type { UserInfo } from "./UserTypes";
import { parseJwt } from "../utils/parseJwt";
import Layout from "../components/common/Layout";
import Button from "../components/common/Button";

export default function UserProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      window.location.href = "/";
      return;
    }
    const payload = parseJwt(token);
    const userId = Number(payload?.sub);
    if (!userId) return;

    getUser(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  const handleChangePassword = async () => {
    if (!user) return;
    if (!currentPw || !newPw || !confirmPw) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (newPw !== confirmPw) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    await changePassword(user.id, currentPw, newPw, confirmPw);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  if (loading) return <LoadingBox>프로필 정보를 불러오는 중...</LoadingBox>;

  return (
    <Layout>
      <Page>
        <ProfileCard>
          <Header>
            <Avatar>{user?.name.charAt(0).toUpperCase()}</Avatar>
            <HeaderInfo>
              <Name>{user?.name}</Name>
              <SubText>{user?.email}</SubText>
            </HeaderInfo>
          </Header>

          <InfoList>
            <InfoRow>
              <Label>직급</Label>
              <Value>{user?.rank}</Value>
            </InfoRow>
            <InfoRow>
              <Label>근무형태</Label>
              <Value>{user?.workType}</Value>
            </InfoRow>
            <InfoRow>
              <Label>지역</Label>
              <Value>{user?.region}</Value>
            </InfoRow>
            <InfoRow>
              <Label>연락처</Label>
              <Value>{user?.phoneNum}</Value>
            </InfoRow>
          </InfoList>
        </ProfileCard>

        <PasswordCard>
          <Title>비밀번호 변경</Title>
          <FormBox>
            <Field>
              <Input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </Field>
            <Field>
              <Input
                type="password"
                placeholder="새 비밀번호"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </Field>
            <Field>
              <Input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </Field>
            <ButtonBox>
              <StyledButton onClick={handleChangePassword}>
                비밀번호 변경
              </StyledButton>
            </ButtonBox>
          </FormBox>
        </PasswordCard>
      </Page>
    </Layout>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  height: calc(100vh - 64px);
  background: #f9fafb;
`;

const ProfileCard = styled.div`
  width: 500px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  padding: 1.8rem 2.2rem;
`;

const PasswordCard = styled(ProfileCard)`
  padding: 1.6rem 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 1.6rem;
`;

const Avatar = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #111, #2c2c2c);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 1.8rem;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 4px;
`;

const SubText = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f1f1;
  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;

const Value = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #111;
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 1.2rem;
  margin-left: 1rem;
`;

const FormBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Field = styled.div`
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Input = styled.input`
  width: 90%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:focus {
    border-color: #111;
    background: #fff;
    outline: none;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
`;

const StyledButton = styled(Button)`
  min-width: 130px;
  padding: px 0;
  font-weight: 600;
  border-radius: 8px;
  font-size: 0.9rem;
`;

const LoadingBox = styled.div`
  text-align: center;
  margin-top: 100px;
  font-size: 1rem;
  color: #444;
`;
