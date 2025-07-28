import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
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
