import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUserProfile } from '../../shared/models/global.interface';
import { BASE_BACKEND_URL } from '../../../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class AppService {
  constructor(private http: HttpClient) { }

  getUserData(): Observable<IUserProfile> {
    return this.http.get<IUserProfile>(`${BASE_BACKEND_URL}/api/user/profile`);
  }
}
