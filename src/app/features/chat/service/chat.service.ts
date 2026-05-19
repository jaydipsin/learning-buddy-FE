import { inject, Injectable, signal } from '@angular/core';
import { BASE_BACKEND_URL } from '../../../../enviroment/enviroment';
import { authStore } from '../../auth/store/auth.store';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  authStoreInstance = inject(authStore);
  authService = inject(AuthService);
  currentResponse = signal('');
  // private token = inject(authStore).accessToken()
  private token = inject(LocalStorageService).getUserData()?.accessToken;

  async aiChatApi(message: string, onChunk: (text: string) => void) {
    try {
      let response = await fetch(`${BASE_BACKEND_URL}/api/dashboard/chat-with-ai-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },

        body: JSON.stringify({
          message,
        }),
      });

      if (response.status === 401) {
        try {
          const refreshResponse = await firstValueFrom(this.authService.refreshToken());
          this.token = refreshResponse.data.accessToken;

          response = await fetch(`${BASE_BACKEND_URL}/api/dashboard/chat-with-ai-mentor`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({ message }),
          });

          if (!response.ok) throw new Error('Failed after token refresh');
        } catch (error) {
          this.authStoreInstance.logOut();
          return;
        }
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream not supported');
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader?.read();
        if (done) break;

        // Convert the chunk to a string and append it
        const chunk = decoder.decode(value, { stream: true });
        result = chunk;
        let count = 0;

        // Update your UI state/Signal/Subject here in real-time
        this.currentResponse.set(result);
        onChunk(result);
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }
}
