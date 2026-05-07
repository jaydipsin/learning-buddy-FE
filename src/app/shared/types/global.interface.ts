export type GlobalAppState = {
  isLoading: boolean;
  error: string | null;
  appData: IAppData | null;
  isAuthenticated: boolean;
};

export interface IAppData {
  userDetails: IUserProfile | null;
}

export interface IUserProfile {
  id: string;
  email: string;
  userName: string;
  organizationName: string;
  parentNumber: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  themePreference: 'light' | 'dark';
  course: {
    id: string;
    name: string;
    isCurrentlyActive: boolean;
    subjects: {
      id: string;
      name: string;
    }[];
  }[];
  streak: number;
  isPremium: boolean;
}


// Local storage interface 

export interface IStateData {
  userData: IUserProfile | null;
  accessToken: string | null;
  themePreference: 'light' | 'dark';
}


export enum Role {
  Admin = 'Admin',
  Teacher = 'Teacher',  
  Student = 'Student',
  Parent = 'Parent',
}