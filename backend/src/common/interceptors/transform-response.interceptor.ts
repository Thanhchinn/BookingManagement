import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function transformValue(val: any): any {
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
    return val.map(transformValue);
  }

  // Handle Date objects (keep them intact)
  if (val instanceof Date) {
    return val;
  }

  // Handle general Objects
  if (typeof val === 'object') {
    const transformed: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        transformed[key] = transformValue(val[key]);
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
