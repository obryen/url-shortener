import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { getOrmConfiguration } from './common/config/orm-config';
import { getConfigFromEnv } from './common/config/configuration.dto';
import { UrlShortenerModule } from './url-shortener-module/url-shortener.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    ignoreEnvFile: false,
    load: [getConfigFromEnv],
  }),
  TypeOrmModule.forRoot(getOrmConfiguration()),
    UrlShortenerModule
  ],

  controllers: [],
  providers: [],
})
export class AppModule { }
