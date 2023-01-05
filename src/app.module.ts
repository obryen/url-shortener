import { Module } from '@nestjs/common';
import { ShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.service';

@Module({
  imports: [],
  controllers: [ShortenerController],
  providers: [UrlShortenerService],
})
export class AppModule { }
