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
      map((value: { data: any; message: string; statusCode: number }) => {
        const { data = null, message = 'OK', statusCode = 200 } = value;
        return { statusCode, data, message };
      }),
    );
  }
}
