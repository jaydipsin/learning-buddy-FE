import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  /**
   * Transforms seconds or minutes into a clean readable string.
   * @param value Numerical time
   * @param unit 'seconds' | 'minutes' (default: 'minutes')
   * @param format 'short' (e.g. "2h 48m") | 'clock' (e.g. "02:48:00")
   */
  transform(
    value: number | null | undefined,
    unit: 'seconds' | 'minutes' = 'minutes',
    format: 'short' | 'clock' = 'short'
  ): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '--';
    }

    const totalSeconds = unit === 'minutes' ? Math.round(value * 60) : Math.round(value);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (format === 'clock') {
      const pad = (num: number) => num.toString().padStart(2, '0');
      if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      }
      return `${pad(minutes)}:${pad(seconds)}`;
    }

    // format === 'short'
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (minutes > 0) {
      return seconds > 0 && unit === 'seconds' ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  }
}
