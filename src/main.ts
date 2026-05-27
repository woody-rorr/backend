import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // 06-runtime-rules.md §1 - controller 단위 path로 관리, /health는 prefix 제외
  app.setGlobalPrefix('', { exclude: ['/health'] });

  // 06-runtime-rules.md §1 / §7 - 모든 입력 DTO 검증, 화이트리스트 + 자동 변환
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 06-runtime-rules.md §1 - CORS 허용 목록은 env(CORS_ORIGINS)에서
  const corsOrigins = config.get<string[]>('corsOrigins') ?? [];
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
  });

  // 06-runtime-rules.md §1 / §9 - graceful shutdown
  app.enableShutdownHooks();

  // 01-stack-and-deploy.md §6 - Swagger @ /api-docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('new-project API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // 07-env-and-secrets.md §1 - PORT
  const port = config.get<number>('port') ?? 5013;
  await app.listen(port);
  Logger.log(`new-project API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();
