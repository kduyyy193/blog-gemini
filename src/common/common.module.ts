import { Module } from '@nestjs/common';
import { CustomLoggerService } from './services/logger.service';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

@Module({
  providers: [CustomLoggerService, AllExceptionsFilter, TransformInterceptor],
  exports: [CustomLoggerService, AllExceptionsFilter, TransformInterceptor],
})
export class CommonModule {}
