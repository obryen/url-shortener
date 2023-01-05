import { getConfigFromEnv } from './configuration.dto';

/**
 * Get orm configuration details
 * @returns TypeOrmModuleOptions
 */
export const getOrmConfiguration = () => {
  const configuration = getConfigFromEnv();
  return {
    type: 'postgres',
    host: configuration.postgresHost,
    port: configuration.postgresPort,
    username: configuration.postgresUsername,
    password: configuration.postgresPassword,
    database: configuration.postgresDatabaseName,
    autoLoadEntities: true,
    migrationsTableName: 'migration',
    migrations: ['src/migration/*.ts'],
    logging: false,
    synchronize: false,
    ssl: configuration.environment == 'production',
  };
  ;
};
