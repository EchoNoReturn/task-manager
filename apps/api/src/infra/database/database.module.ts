import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>("NODE_ENV") === "production";

        const url = config.get<string>("DATABASE_URL");
        console.log("DATABASE_URL:", url);

        return {
          type: "postgres",
          url,
          autoLoadEntities: true,
          synchronize: !isProduction,
          migrationsRun: isProduction,
          migrations: ["dist/database/migrations/*{.ts,.js}"],
          logging: !isProduction,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
