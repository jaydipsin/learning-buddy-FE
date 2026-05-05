import { Injectable } from '@angular/core';
import { ILoginPayload, Iregistrationpayload } from '../interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BASE_BACKEND_URL } from '../../../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) { }
  register(payload: Iregistrationpayload): Observable<{ message: string }> {
    // Implement registration logic here, e.g., call API, handle response, etc.
    return this.http.post<{ message: string }>(BASE_BACKEND_URL + "/auth/register", payload);
  }
  login(payload: ILoginPayload): Observable<{ message: string }> {
    // Implement login logic here, e.g., call API, handle response, etc.
    return this.http.post<{ message: string }>(BASE_BACKEND_URL + "/auth/login", payload);
  }
  logout(): void {
    // Implement logout logic here, e.g., clear tokens, reset state, etc.
  }
}
