import { IUserProfile } from "../shared/types/global.interface";

export interface Iregistrationpayload {
  email: string;
  username: string;
  password: string;
  course: string[];
  organizationName?: string;
  parentNumber?: string;
  avatarUrl?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
}


export interface ILoginPayload {
  email: string;
  password: string;
}


export interface IAuthResponse {
  message: string;
  data: {
    accessToken: string;
    userData: IUserProfile;
  };
}
