import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordinal',
  standalone: true,
})
export class OrdinalPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    const n = Math.abs(Math.round(value));
    const formattedNum = n.toLocaleString('en-US');
    const remainder10 = n % 10;
    const remainder100 = n % 100;

    let suffix = 'th';
    if (remainder10 === 1 && remainder100 !== 11) {
      suffix = 'st';
    } else if (remainder10 === 2 && remainder100 !== 12) {
      suffix = 'nd';
    } else if (remainder10 === 3 && remainder100 !== 13) {
      suffix = 'rd';
    }

    return `${formattedNum}${suffix}`;
  }
}
