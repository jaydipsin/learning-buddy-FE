import { Injectable } from '@angular/core';
import { IAuthResponse, ILoginPayload, Iregistrationpayload } from '../interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BASE_BACKEND_URL } from '../../../enviroment/enviroment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) { }
  register(payload: Iregistrationpayload): Observable<IAuthResponse> {
    // Implement registration logic here, e.g., call API, handle response, etc.
    return this.http.post<IAuthResponse>(BASE_BACKEND_URL + "/auth/register", payload);
  }
  login(payload: ILoginPayload): Observable<IAuthResponse> {
    // Implement login logic here, e.g., call API, handle response, etc.
    return this.http.post<IAuthResponse>(BASE_BACKEND_URL + "/auth/login", payload);
  }
  logout(): void {
    // Implement logout logic here, e.g., clear tokens, reset state, etc.
  }
}
