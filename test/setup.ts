import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserModule } from '../src/modules/user/user.module';
import { UserEntity } from '../src/modules/user/entities/user.entity';

export const testTypeOrmOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'backend_test',
  entities: [UserEntity],
  synchronize: true,
  dropSchema: false,
};

export async function createTestingModule(): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [TypeOrmModule.forRoot(testTypeOrmOptions), UserModule],
  }).compile();
}

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await createTestingModule();
  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  return app;
}

export async function truncateUsers(dataSource: DataSource): Promise<void> {
  await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
}
