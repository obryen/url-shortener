import { Test, TestingModule } from '@nestjs/testing';
import { ShortenerController } from './url-shortener.controller';
import { UrlShortenerService } from './url-shortener.service';

describe('AppController', () => {
  let appController: ShortenerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [UrlShortenerService],
    }).compile();

    appController = app.get<ShortenerController>(ShortenerController);
  });
});
