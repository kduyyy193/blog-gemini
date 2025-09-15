import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [HealthModule, PrismaModule, CommonModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }), AuthModule, BlogModule],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule {}
