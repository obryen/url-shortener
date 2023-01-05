import { Response } from 'express';
import { BadRequestException, Controller, Get } from '@nestjs/common';
import { Body, Param, Post, Res } from '@nestjs/common/decorators';
import { UrlShortenerService } from './url-shortener.service';
import { INVALID_SHORT_CODE, MISSING_URL, SHORT_CODE_INPUT_TOO_SMALL } from '../common/constants.errors';
import { IshortenerRequest } from './interfaces/url-shortener.interface';

@Controller()
export class ShortenerController {
  constructor(private readonly service: UrlShortenerService) { }


  @Get(':shortCode')
  async resolveShortUrl(
    @Param('shortCode') shortUrlCode: string,
    @Res() res: Response,
  ) {
    if (!shortUrlCode) throw new BadRequestException(INVALID_SHORT_CODE);
    return await this.service.resolveAndRedirectShortUrl(
      shortUrlCode,
      res,
    );
  }

  @Get(':shortCode/stats')
  async getShortUrlStats(@Param('shortCode') shortUrlCode: string) {
    return await this.service.getShortUrlStats(shortUrlCode);
  }

  @Post("submit")
  async shorten(@Body() shortenerReq: IshortenerRequest): Promise<string> {
    if (!shortenerReq.url) throw new BadRequestException(MISSING_URL);
    if (shortenerReq.shortCode?.length < 4) throw new BadRequestException(SHORT_CODE_INPUT_TOO_SMALL);
    return await this.service.shortenUrl(shortenerReq);
  }

}
