import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function transformValue(val: any, key?: string): any {
  if (val === null || val === undefined) {
    return val;
  }

  // Convert BigInt to string
  if (typeof val === 'bigint') {
    return val.toString();
  }

  // Convert Prisma Decimal to number
  if (
    typeof val === 'object' &&
    val.constructor &&
    (val.constructor.name === 'Decimal' ||
      (val.d !== undefined && val.s !== undefined && val.e !== undefined))
  ) {
    return Number(val.toString());
  }

  // Handle Arrays
  if (Array.isArray(val)) {
    return val.map((v) => transformValue(v, key));
  }

  // Handle Date objects
  if (val instanceof Date) {
    if (key === 'bookingDate' || key === 'playDate' || key === 'date') {
      try {
        return val.toISOString().split('T')[0];
      } catch {
        return val;
      }
    }
    if (key === 'startTime' || key === 'endTime') {
      try {
        return val.toISOString().substring(11, 16);
      } catch {
        const hours = val.getUTCHours().toString().padStart(2, '0');
        const minutes = val.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    return val;
  }

  // Handle general Objects
  if (typeof val === 'object') {
    const transformed: any = {};
    for (const k in val) {
      if (Object.prototype.hasOwnProperty.call(val, k)) {
        transformed[k] = transformValue(val[k], k);
      }
    }
    return transformed;
  }

  return val;
}

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => transformValue(data)));
  }
}

