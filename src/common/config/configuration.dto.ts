export class Configuration {
  environment: string;
  port: number;
  postgresHost: string;
  postgresPort: number;
  postgresDatabaseName: string;
  postgresUsername: string;
  postgresPassword: string;
  syncDatabase: boolean;
}

export const getConfigFromEnv = (): Configuration => ({
  environment: process.env.ENVIRONMENT || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  postgresHost: process.env.POSTGRES_HOST,
  postgresPort: parseInt(process.env.POSTGRES_PORT),
  postgresDatabaseName: process.env.POSTGRES_DATABASE_NAME,
  postgresUsername: process.env.POSTGRES_USERNAME,
  postgresPassword: process.env.POSTGRES_PASSWORD,
  syncDatabase: Boolean(process.env.SYNC_DATABASE),
});
