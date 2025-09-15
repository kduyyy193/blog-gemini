import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CustomLoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL] 
      : '*',
    credentials: true,
  });


  app.useLogger(app.get(CustomLoggerService));
  app.useGlobalFilters(app.get(AllExceptionsFilter));
  app.useGlobalInterceptors(app.get(TransformInterceptor));

  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      const errors = {};
      validationErrors.forEach(err => {
        errors[err.property] = Object.values(err.constraints).join(', ');
      });
      return new BadRequestException({ errors });
    },
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server is running on http://localhost:${process.env.PORT }/api`);
}
bootstrap();
