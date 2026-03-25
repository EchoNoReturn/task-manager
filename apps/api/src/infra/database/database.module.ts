import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'),
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          database: config.get<string>('DB_NAME', 'productor'),
          username: config.get<string>('DB_USER', 'postgres'),
          password: config.get<string>('DB_PASSWORD', ''),
          autoLoadEntities: true,
          synchronize: !isProduction,
          migrationsRun: isProduction,
          migrations: ['dist/database/migrations/*{.ts,.js}'],
          poolSize: config.get<number>('DB_POOL_SIZE', 10),
          logging: !isProduction,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
