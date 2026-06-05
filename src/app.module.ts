import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { validationSchema } from './config/configuration';
import { AppDataSource } from './database/data-source';
import { MemberModule } from './modules/member/member.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({ ...AppDataSource.options }),
    }),
    // === FEATURE MODULES (accumulated: member, auth) ===
    MemberModule,
    AuthModule,
  ],
})
export class AppModule {}
