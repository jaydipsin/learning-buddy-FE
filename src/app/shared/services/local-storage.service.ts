import { Injectable } from '@angular/core';
import { IStateData } from '../types/global.interface';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  constructor() {}

  private storageKey = 'learningBuddyUserData';

  getStorageKey(): string {
    return this.storageKey;
  }

  saveUserData(appData: Partial<IStateData>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(appData));
  }

  getUserData(): IStateData | null {
    const userData = localStorage.getItem(this.storageKey);
    return userData ? JSON.parse(userData) : null;
  }

  clearUserData(): void {
    localStorage.removeItem(this.storageKey);
  }

  saveThemePreference(themePreference: 'light' | 'dark'): void {
    const userData = this.getUserData();
    if (userData) {
      userData.themePreference = themePreference;
      this.saveUserData(userData);
    }
  }
}
