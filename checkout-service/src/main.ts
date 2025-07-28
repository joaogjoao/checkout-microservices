import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // remove propriedades não declaradas no DTO
    forbidNonWhitelisted: true, // retorna erro se houver props extras
    transform: true,      // converte tipos (ex.: string → number)
  }));

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS] },
      consumer: { groupId: 'checkout-group' },
    },
  });

  await app.startAllMicroservices();
  const port = 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Checkout Service listening on http://0.0.0.0:${port}`);
}
bootstrap();
