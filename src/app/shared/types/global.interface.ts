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
  name: string;
  avatarUrl?: string;
  roles: string[];
  preferences: {
    theme: 'light' | 'dark';
    lang: string;
  };
}


// Local storage interface 

export interface ILocalStorageData {
  userData: IUserProfile | null;
  accessToken: string | null;
}