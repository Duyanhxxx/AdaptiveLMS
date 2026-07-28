import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub || req.user?.id || 'anonymous';
    return `${req.url}-${userId}`;
  }
}
