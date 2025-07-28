import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { ShippingEventController } from './controllers/shipping-event.controller';
import { ShippingService } from './services/shipping.service';
import { Shipping } from './entities/shipping.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT!,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [Shipping],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Shipping]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS ?? 'kafka:9092'],
          },
          consumer: {
            groupId: 'shipping-group',
          },
        },
      },
    ]),
  ],
  controllers: [ShippingEventController],
  providers: [ShippingService],
})
export class AppModule {}
