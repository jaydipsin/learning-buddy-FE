import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserProfile } from '../types/global.interface';

@Injectable({ providedIn: 'root' })
export class AppService {
  constructor(private http: HttpClient) {}

  getUserData(userId: string): Observable<IUserProfile> {
    return this.http.get<IUserProfile>(`/api/user-data/${userId}`);
  }
}
