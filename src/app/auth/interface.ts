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
