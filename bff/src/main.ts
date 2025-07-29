import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  const config = new DocumentBuilder()
    .setTitle('BFF')
    .setDescription('Backend for Frontend API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api-docs', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`BFF listening on http://0.0.0.0:${port}`);
}
bootstrap();
