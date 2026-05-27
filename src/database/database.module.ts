import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../modules/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('db.host'),
        port: config.get<number>('db.port', 5432),
        username: config.get<string>('db.user'),
        password: config.get<string>('db.password'),
        database: config.get<string>('db.name'),
        ssl:
          config.get<boolean>('db.ssl')
            ? { rejectUnauthorized: false }
            : false,
        entities: [UserEntity],
        migrationsTableName: 'migrations',
        synchronize: false,
        autoLoadEntities: true,
        poolSize: 10,
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
