import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.setGlobalPrefix('', { exclude: ['/health'] });
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true,transformOptions:{enableImplicitConversion:true}}));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  const corsOrigins = config.get<string>('corsOrigins');
  app.enableCors({origin:corsOrigins?corsOrigins.split(',').map(o=>o.trim()).filter(Boolean):true,credentials:true});
  app.enableShutdownHooks();
  const swaggerCfg = new DocumentBuilder().setTitle('new-project API').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('api-docs',app,SwaggerModule.createDocument(app,swaggerCfg));
  const port = config.get<number>('port')??5013;
  await app.listen(port,'0.0.0.0');
  Logger.log(`Listening on ${port}`,'Bootstrap');
}
void bootstrap();
