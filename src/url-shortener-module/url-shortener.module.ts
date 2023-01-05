import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortUrlEvent } from './entities/short-url-events.entity';
import { ShortUrlMapping } from './entities/url-shortener.entity';
import { ShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.service';
@Module({
    imports: [
        TypeOrmModule.forFeature([ShortUrlEvent, ShortUrlMapping])
    ],
    controllers: [ShortenerController],
    providers: [UrlShortenerService],
    exports: [TypeOrmModule]
})
export class UrlShortenerModule { }
