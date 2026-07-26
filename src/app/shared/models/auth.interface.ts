import { IUserProfile, Role } from "./global.interface";

export interface Iregistrationpayload {
  email: string;
  userName: string;
  password: string;
  course: string[];
  organizationName?: string;
  parentNumber?: string;
  avatarUrl?: string;
  role: Role;
}


export interface ILoginPayload {
  email: string;
  password: string;
}


export interface IAuthResponse {
  message: string;
  data: {
    accessToken: string | null; // if null then user is not verified
    userData: IUserProfile;
  };
}


export interface IRegisterResponse {
  message: string;
  data: {
    userData: IUserProfile;
  };
}