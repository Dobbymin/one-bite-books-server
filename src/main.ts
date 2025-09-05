import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import { AppModule } from './app.module';

import { ClassValidatorException } from './util/class-validator-exeption';
import { PrismaClientExceptionFilter } from './util/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use((req, res, next) => {
    req.headers['content-type'] = 'application/json';
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new ClassValidatorException(errors),
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  // Swagger 문서 (JSON만)
  const config = new DocumentBuilder()
    .setTitle('ONEBITE BOOKS API')
    .setDescription(`한입 도서몰 API 서버 문서입니다.`)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // JSON endpoint → /api-json
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.json(document);
  });

  // UI endpoint → /api
  const theme = new SwaggerTheme();
  app.getHttpAdapter().get('/api', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ONEBITE BOOKS API</title>
          <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
          <style>${theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK)}</style>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
          <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
          <script>
            window.onload = () => {
              SwaggerUIBundle({
                url: '/api-json',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: "BaseLayout"
              });
            };
          </script>
        </body>
      </html>
    `);
  });

  await app.listen(12345);
}
bootstrap();
