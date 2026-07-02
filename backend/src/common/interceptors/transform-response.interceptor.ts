import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function fastTransform(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  const serialized = JSON.stringify(data, function(key, value) {
    const rawVal = this[key];

    if (typeof rawVal === 'bigint') {
      return rawVal.toString();
    }

    if (
      rawVal &&
      typeof rawVal === 'object' &&
      rawVal.constructor &&
      (rawVal.constructor.name === 'Decimal' ||
        (rawVal.d !== undefined && rawVal.s !== undefined && rawVal.e !== undefined))
    ) {
      return Number(rawVal.toString());
    }

    if (rawVal instanceof Date) {
      if (key === 'bookingDate' || key === 'playDate' || key === 'date') {
        try {
          return rawVal.toISOString().split('T')[0];
        } catch {
          return value;
        }
      }
      if (key === 'startTime' || key === 'endTime') {
        try {
          return rawVal.toISOString().substring(11, 16);
        } catch {
          const hours = rawVal.getUTCHours().toString().padStart(2, '0');
          const minutes = rawVal.getUTCMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
      }
      return value;
    }

    return value;
  });

  return JSON.parse(serialized);
}

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => fastTransform(data)));
  }
}

