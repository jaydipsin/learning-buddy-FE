import { inject, Injectable, Injector } from '@angular/core';
import {
  IAuthResponse,
  ILoginPayload,
  Iregistrationpayload,
} from '../../shared/models/auth.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BASE_BACKEND_URL } from '../../../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}
  register(payload: Iregistrationpayload): Observable<IAuthResponse> {
    // Implement registration logic here, e.g., call API, handle response, etc.
    return this.http.post<IAuthResponse>(BASE_BACKEND_URL + '/auth/register', payload);
  }
  login(payload: ILoginPayload): Observable<IAuthResponse> {
    // Implement login logic here, e.g., call API, handle response, etc.
    return this.http.post<IAuthResponse>(BASE_BACKEND_URL + '/auth/login', payload);
  }
  logout() {
    return this.http.post(BASE_BACKEND_URL + '/auth/logout', {});
  }

  refreshToken(): Observable<{ data: { accessToken: string }, message: string }> {
    return this.http.get<{ data: { accessToken: string }, message: string }>(BASE_BACKEND_URL + '/auth/refresh');
  }

  // Need to change api calling place this
  getAllCourses(): Observable<{ message: string; courses: any[] }> {
    return this.http.get<{ message: string; courses: any[] }>(
      BASE_BACKEND_URL + '/api/learning-buddy/courses',
    );
  }
}
