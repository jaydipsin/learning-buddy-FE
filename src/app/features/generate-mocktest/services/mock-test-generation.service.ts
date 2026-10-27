import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BASE_BACKEND_URL } from '../../../../enviroment/enviroment';
import { authStore } from '../../../features/auth/store/auth.store';

export interface MockTestGenerationPayload {
  courseId: string;
  subject?: string[];
  pyqYears?: number[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  isPublic: boolean;
}

export interface MockTestGenerationJob {
  jobId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  stage?: string;
  questionIds?: string[];
  mockTestId?: string;
  attemptId?: string;
  error?: string;
}

interface StartMockTestResponse {
  success: boolean;
  data: MockTestGenerationJob;
}

@Injectable({ providedIn: 'root' })
export class MockTestGenerationService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(authStore);

  async generate(
    payload: MockTestGenerationPayload,
    onProgress: (job: MockTestGenerationJob) => void,
  ): Promise<MockTestGenerationJob> {
    const response = await firstValueFrom(
      this.http.post<StartMockTestResponse>(
        `${BASE_BACKEND_URL}/api/test/generate-mock-test`,
        payload,
      ),
    );

    return this.streamJob(response.data.jobId, onProgress);
  }

  private async streamJob(
    jobId: string,
    onProgress: (job: MockTestGenerationJob) => void,
  ): Promise<MockTestGenerationJob> {
    const token = this.auth.accessToken();
    if (!token) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    const response = await fetch(
      `${BASE_BACKEND_URL}/api/test/mock-test-jobs/${jobId}/events`,
      {
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Unable to connect to mock-test generation (${response.status}).`);
    }

    if (!response.body) {
      throw new Error('Mock-test progress streaming is not supported by this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let completedJob: MockTestGenerationJob | null = null;

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const rawEvent of events) {
        const job = this.parseEvent(rawEvent);
        if (!job) {
          continue;
        }

        onProgress(job);

        if (job.status === 'failed') {
          throw new Error(job.error || 'Mock-test generation failed.');
        }

        if (job.status === 'completed') {
          completedJob = job;
        }
      }

      if (completedJob || done) {
        break;
      }
    }

    if (!completedJob?.questionIds?.length) {
      throw new Error('Mock-test generation ended without returning questions.');
    }

    return completedJob;
  }

  private parseEvent(rawEvent: string): MockTestGenerationJob | null {
    const data = rawEvent
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n');

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as MockTestGenerationJob;
    } catch {
      throw new Error('Received invalid mock-test progress data.');
    }
  }
}
