import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

describe('main.ts', () => {
  const NestFactorySpy = jest.spyOn(NestFactory, 'create');
  const createDocumentSpy = jest.spyOn(SwaggerModule, 'createDocument');
  const mockSwaggerSetup = jest.spyOn(SwaggerModule, 'setup').mockReturnValue();
  const mockApp = { listen: jest.fn() };
  const mockSwagger = { fake: 'OPeniAPIObject' };
  beforeAll(async () => {
    NestFactorySpy.mockResolvedValue((mockApp as unknown) as INestApplication);
    createDocumentSpy.mockReturnValue(
      (mockSwagger as unknown) as OpenAPIObject,
    );
    await import('./main');
  });
  it('should create an Nest app using the app module', () => {
    expect(NestFactorySpy).toHaveBeenCalledWith(AppModule);
  });
  it('should listen at port 3000 in the nest app', () => {
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });
  it('should setup the openapi documentation with the app and the swagger document', () => {
    expect(mockSwaggerSetup).toHaveBeenCalledWith(
      'api_doc',
      mockApp,
      mockSwagger,
    );
  });
});
