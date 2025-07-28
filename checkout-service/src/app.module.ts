import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CheckoutController } from './controllers/checkout.controller';
import { CheckoutService } from './services/checkout.service';
import { Checkout } from './domain/entities/checkout.entity';
import { CheckoutEventsController } from './controllers/checkout-events.controller';
import { CheckoutItem } from './domain/entities/checkout-item.entity';
import { Address } from './domain/entities/address.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Checkout, CheckoutItem, Address],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Checkout, CheckoutItem, Address]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS ?? "kafka:9092"],
          },
          consumer: {
            groupId: 'checkout-group',
          },
        },
      },
    ]),
  ],
  controllers: [CheckoutController, CheckoutEventsController],
  providers: [CheckoutService],
})
export class AppModule { }
