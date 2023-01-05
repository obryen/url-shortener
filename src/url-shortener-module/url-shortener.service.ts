import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { ShortUrlEvent } from './entities/short-url-events.entity';
import { ShortUrlMapping } from './entities/url-shortener.entity';
import { IshortenerRequest, IsaveShortenedUrl } from './interfaces/url-shortener.interface';
import { SHORT_CODE_DOES_NOT_EXIST } from '../common/constants.errors';
import { IShortenedUrlStats } from './interfaces/url-shortener-stats.interface'

@Injectable()
export class UrlShortenerService {

  constructor(
    @InjectRepository(ShortUrlMapping)
    private readonly urlShortenerRepository: Repository<ShortUrlMapping>,
    @InjectRepository(ShortUrlEvent)
    private readonly urlShortenerEventsRepository: Repository<ShortUrlEvent>
  ) { }

  async shortenUrl(shortenRequest: IshortenerRequest): Promise<string> {
    const shortCode = await this.resolveShortCode(shortenRequest);
    const shortUrl = this.buildShortUrl(shortCode, shortenRequest.url);
    await this.saveShortUrl({ url: shortenRequest.url, shortCode, shortUrl });
    return shortUrl;
  }

  async resolveShortCode(shortenRequest: IshortenerRequest): Promise<string> {
    if (shortenRequest.shortCode) {
      const existingShortCode = await this.urlShortenerRepository.findOne({ where: { shortCode: shortenRequest.shortCode } });
      if (existingShortCode) {
        throw new BadRequestException('Short code is already in use');
      }
      return shortenRequest.shortCode;
    }

    return crypto.randomUUID().replace("-", "").substring(0, 6);
  }

  buildShortUrl(shortCode: string, url: string): string {
    return `${url}/${shortCode}`;
  }

  saveShortUrl(shortenRequest: IsaveShortenedUrl): Promise<ShortUrlMapping> {
    const newShortenedUrl = new ShortUrlMapping({
      originalUrl: shortenRequest.url,
      shortCode: shortenRequest.shortCode,
      shortUrl: shortenRequest.shortUrl
    });
    return this.urlShortenerRepository.save(newShortenedUrl);
  }


  async fetchShortCodeMapping(shortCode: string) {
    const exisitingShortCodeMapping = await this.urlShortenerRepository.findOne({
      where: {
        shortCode,
      },
    });

    if (!exisitingShortCodeMapping) {
      throw new NotFoundException(
        SHORT_CODE_DOES_NOT_EXIST,
      );
    }

    return exisitingShortCodeMapping;
  }

  async resolveAndRedirectShortUrl(shortUrlCode: string, res: Response) {
    const exisitingUrl = await this.fetchShortCodeMapping(shortUrlCode);

    // save stats
    const newEvent = new ShortUrlEvent({
      shortUrlId: exisitingUrl.id,
    })
    await this.urlShortenerEventsRepository.save(newEvent);

    res.redirect(exisitingUrl.originalUrl);
  }

  async getShortUrlStats(shortCode: string): Promise<IShortenedUrlStats> {

    const shortCodeMapping = await this.fetchShortCodeMapping(shortCode);

    const events = await this.urlShortenerEventsRepository.find({
      where: {
        shortUrlId: shortCodeMapping.id,
      },
      order: {
        createdAt: 'DESC'
      }
    })

    const stats: IShortenedUrlStats = {
      accessTimes: events.length,
      createdAt: shortCodeMapping.createdAt,
      lastAccess: events[events.length - 1]?.createdAt,
    }
    return stats;
  }

}

