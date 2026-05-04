import { Injectable } from '@angular/core';
import { Iregistrationpayload } from '../interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() {}
  register(payload: Iregistrationpayload): Observable<void> {
    // Implement registration logic here, e.g., call API, handle response, etc.
    return new Observable<void>((observer) => {
      // Simulate API call
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 1000);
    });
  }
  login(username: string, password: string): Observable<void> {
    // Implement login logic here, e.g., call API, handle response, etc.
    return new Observable<void>((observer) => {
      // Simulate API call
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 1000);
    });
  }
  logout(): void {
    // Implement logout logic here, e.g., clear tokens, reset state, etc.
  }
}
