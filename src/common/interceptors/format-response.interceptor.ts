import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((res) => {
        if (res.pagination) {
          return {
            data: res.data,
            message: 'OK',
            pagination: res.pagination,
          };
        }
        return {
          data: res,
          message: 'OK',
        };
      }),
    );
  }
}
