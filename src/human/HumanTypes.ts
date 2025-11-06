export type UserRecord = {
  id: number;
  name: string;
  regionId: number;
  region: string;
  workTypeId: number;
  workType: string;
  rank: string;
  email: string;
  phoneNum: string;
};

export type Region = {
  regionId: number;
  regionName: string;
};

export type WorkType = {
  workTypeId: number;
  workTypeName: string;
};

export type Rank = {
  rankId: number;
  rankName: string;
};

export type CreateUserDTO = {
  email: string;
  password: string;
  name: string;
  phoneNum: string;
  regionId: number;
  rank: string;
  workTypeId: number;
};
