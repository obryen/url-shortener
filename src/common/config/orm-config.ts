import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ShortUrlEvent } from 'src/url-shortener-module/entities/short-url-events.entity';
import { ShortUrlMapping } from 'src/url-shortener-module/entities/url-shortener.entity';
import { getConfigFromEnv } from './configuration.dto';

/**
 * Get orm configuration details
 * @returns TypeOrmModuleOptions
 */
export const getOrmConfiguration = (): TypeOrmModuleOptions => {
  const configuration = getConfigFromEnv();

  const ormConfigs: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configuration.postgresHost,
    port: configuration.postgresPort,
    username: configuration.postgresUsername,
    password: configuration.postgresPassword,
    database: configuration.postgresDatabaseName,
    entities: [
      ShortUrlEvent,
      ShortUrlMapping,
    ],
    autoLoadEntities: true,
    migrationsTableName: 'migration',
    migrations: ['src/migration/*.ts'],
    logging: false,
    synchronize: configuration.syncDatabase,
    ssl: configuration.environment == 'production',
  };

  console.log('getOrmConfiguration: configuration) = ', ormConfigs);
  return ormConfigs;
};
