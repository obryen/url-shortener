import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { getConfigFromEnv } from "../../common/config/configuration.dto";
import { SHORT_CODE_DOES_NOT_EXIST } from "../../common/constants.errors";
import { ShortUrlEvent } from "../entities/short-url-events.entity";
import { ShortUrlMapping } from "../entities/url-shortener.entity";
import { UrlShortenerService } from "../url-shortener.service";

const MOCK_SAVED_URL_MAPPING: ShortUrlMapping = {
    id: '1',
    originalUrl: "https://www.google.com",
    shortCode: "1234",
    shortUrl: "https://www.g.c/1234",
    createdAt: new Date(),
    shortUrlEvents: []
}
const MOCK_FIND_ONE_RESULT = new ShortUrlMapping({
    ...MOCK_SAVED_URL_MAPPING,
});

const MOCK_FIND_ONE_SHORT_URL_EVENT = new ShortUrlEvent({
    createdAt: new Date(),
    id: 'SHORT--EVENT-1',
    shortUrlId: MOCK_FIND_ONE_RESULT.id,
    shortUrlMapping: MOCK_FIND_ONE_RESULT,
})
const MOCK_FIND_SHORT_URL_EVENTS = [
    { ...MOCK_FIND_ONE_SHORT_URL_EVENT }
]

const SHORT_LINK = getConfigFromEnv().reverseProxyShortLink;

let service;
let repository;
describe("url-shortener-service", () => {
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [{
                provide: getRepositoryToken(ShortUrlMapping),
                useValue: {
                    findOne: jest
                        .fn()
                        .mockResolvedValue(null),
                    save: jest.fn().mockResolvedValue({ ...MOCK_SAVED_URL_MAPPING }),
                },
            },
            {
                provide: getRepositoryToken(ShortUrlEvent),
                useValue: {
                    find: jest
                        .fn()
                        .mockResolvedValue(MOCK_FIND_SHORT_URL_EVENTS),
                    save: jest.fn().mockResolvedValue({ ...MOCK_FIND_ONE_SHORT_URL_EVENT }),
                },
            },
                UrlShortenerService]
        }).compile();
        repository = module.get<Repository<ShortUrlMapping>>(getRepositoryToken(ShortUrlMapping));
        service = module.get<UrlShortenerService>(UrlShortenerService);
    });

    describe("when shortenUrl is called", () => {
        test("shortenUrl should be defined", () => {
            expect(service.shortenUrl).toBeDefined();
        });
        test("resolveShortCode should be called with correct parameters", async () => {
            const spy = jest.spyOn(service, "resolveShortCode");
            await service.shortenUrl({ url: "https://www.google.com", shortCode: "1234" });
            expect(spy).toHaveBeenCalledWith({ url: "https://www.google.com", shortCode: "1234" });
        });

        test("buildShortUrl should be called with correct parameters", async () => {
            const spy = jest.spyOn(service, "buildShortUrl");
            const resolveShortCodedOutput = "1234";
            const shortenUrlPayload = { url: "https://www.google.com", shortCode: "1234" };
            jest.spyOn(service, "resolveShortCode").mockResolvedValue(resolveShortCodedOutput);
            await service.shortenUrl(shortenUrlPayload);
            expect(spy).toHaveBeenCalledWith(resolveShortCodedOutput, SHORT_LINK);
        });
    });

    describe("when resolveShortCode is called", () => {
        test("then it should be defined", () => {
            expect(service.resolveShortCode).toBeDefined();
        });
        describe("with user defined short code", () => {
            test("then short code is not found, it should return the given short code", async () => {
                const shortCode = "1234";
                const url = "https://www.google.com";
                jest.spyOn(repository, "findOne").mockResolvedValue(null);
                const result = await service.resolveShortCode({ url, shortCode });
                expect(result).toBe(shortCode);
            });
            // test("then short code is less than 4 characters long, it should throw an error", async () => {
            //     const shortCode = "1234";
            //     const url = "https://www.google.com";
            //     await expect(service.resolveShortCode({ url, shortCode })).rejects.toThrowError();
            // });

            test("then short code is found, it should throw an error", async () => {
                const shortCode = "1234";
                const url = "https://www.google.com";
                jest.spyOn(repository, "findOne").mockResolvedValue({ ...MOCK_FIND_ONE_RESULT });
                await expect(service.resolveShortCode({ url, shortCode })).rejects.toThrowError(new BadRequestException('Short code is already in use'));
            });


        });
        describe("without user defined short code", () => {
            test("then it should return a  short code with the legnth of exactly 6", async () => {
                const url = "https://www.google.com";
                const result = await service.resolveShortCode({ url });
                expect(result.length).toEqual(6);
            });
        })
    });

    describe("when buildShortUrl is called", () => {
        test("then it should be defined", () => {
            expect(service.buildShortUrl).toBeDefined();
        });
        test("then it should return a short url with the given short code", () => {
            const shortCode = "1234";
            const url = "https://www.google.com";
            const result = service.buildShortUrl(shortCode, url);
            expect(result).toBe(`${url}/${shortCode}`);
        });
    });

    describe("when saveShortUrl is called", () => {
        test("then it should be defined", () => {
            expect(service.saveShortUrl).toBeDefined();
        });
        test("then it should call repository.save method and pass correct params", async () => {
            const shortCode = "1234";
            const url = "https://www.google.com";
            const shortUrl = "https://www.google.com/1234";
            jest.spyOn(repository, "save").mockResolvedValue({ ...MOCK_SAVED_URL_MAPPING });
            await service.saveShortUrl({ url, shortCode, shortUrl });
            const dataToSave = new ShortUrlMapping({ originalUrl: url, shortCode, shortUrl })
            expect(repository.save).toHaveBeenCalledWith(dataToSave);
        });
    });

    describe("when fetchShortCodeMapping is called", () => {
        test(" then it should find the short code from db", () => {
            const shortCode = "1234";
            jest.spyOn(repository, "findOne").mockResolvedValue({ ...MOCK_FIND_ONE_RESULT });
            service.fetchShortCodeMapping(shortCode);
            expect(repository.findOne).toHaveBeenCalledWith({ "where": { shortCode } });
        });
        test("if short code does not exist it shoud throw error", () => {
            const shortCode = "1234";
            jest.spyOn(repository, "findOne").mockResolvedValue(null);
            expect(service.fetchShortCodeMapping(shortCode)).rejects.toThrowError(new NotFoundException(SHORT_CODE_DOES_NOT_EXIST));
        });
        test("then it should return the original url", async () => {
            const shortCode = "1234";
            const fakedFoundUrlRecord = { ...MOCK_FIND_ONE_RESULT }
            jest.spyOn(repository, "findOne").mockResolvedValue(fakedFoundUrlRecord);
            const result = await service.fetchShortCodeMapping(shortCode);
            expect(result).toBe(fakedFoundUrlRecord);
        });
    });

    describe("when resolveAndRedirectShortUrl is called", () => {
        const shortCode = "1234";
        const fakedResponse = {
            redirect: jest.fn().mockImplementation((url) => { })
        };
        const fakedFoundUrlRecord = { ...MOCK_FIND_ONE_RESULT }
        test("then it should be defined", () => {
            expect(service.resolveAndRedirectShortUrl).toBeDefined();
        });
        test("then it should call fetchShortCodeMapping method and pass correct params", async () => {
            jest.spyOn(service, "fetchShortCodeMapping").mockResolvedValue(fakedFoundUrlRecord);
            await service.resolveAndRedirectShortUrl(shortCode, fakedResponse);
            expect(service.fetchShortCodeMapping).toHaveBeenCalledWith(shortCode);
        });
        test("then it should call redirect method and pass correct params", async () => {
            jest.spyOn(service, "fetchShortCodeMapping").mockResolvedValue(fakedFoundUrlRecord);
            await service.resolveAndRedirectShortUrl(shortCode, fakedResponse);
            expect(fakedResponse.redirect).toHaveBeenCalledWith(fakedFoundUrlRecord.originalUrl);
        });
    })


})