import { Injectable } from '@angular/core';
import { ILocalStorageData } from '../types/global.interface';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  constructor() {}

  private storageKey = 'learningBuddyUserData';

  getStorageKey(): string {
    return this.storageKey;
  }

  saveUserData(appData: ILocalStorageData): void {
    localStorage.setItem(this.storageKey, JSON.stringify(appData));
  }

  getUserData(): ILocalStorageData | null {
    const userData = localStorage.getItem(this.storageKey);
    return userData ? JSON.parse(userData) : null;
  }

  clearUserData(): void {
    localStorage.removeItem(this.storageKey);
  }
}
