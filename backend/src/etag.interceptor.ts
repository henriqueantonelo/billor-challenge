import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as crypto from 'crypto';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        if (data !== undefined && data !== null) {
          const hash = crypto.createHash('sha256');
          hash.update(JSON.stringify(data));
          const etag = `"${hash.digest('base64')}"`;
          response.setHeader('ETag', etag);
        }
        return data;
      }),
    );
  }
}
