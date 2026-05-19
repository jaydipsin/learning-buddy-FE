import { Injectable } from '@angular/core';
import { IStateData } from '../../shared/models/global.interface';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  constructor() { }

  private storageKey = 'learningBuddyUserData';

  getStorageKey(): string {
    return this.storageKey;
  }

  saveUserData(appData: Partial<IStateData>): void {
    localStorage.setItem(this.storageKey, JSON.stringify({ ...this.getUserData() || {}, ...appData }));
  }

  getUserData(): IStateData | null {
    try {
      const userData = localStorage.getItem(this.storageKey);
      if (!userData || userData === 'undefined' || userData === 'null') return null;
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
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
