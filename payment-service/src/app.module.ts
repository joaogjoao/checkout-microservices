import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './domain/entities/payment.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentEventController } from './controllers/payment-event.controller';
import { PaymentService } from './services/payment.service';
import { ConfigModule } from '@nestjs/config';

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
        entities: [Payment],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Payment]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS ?? 'kafka:9092'],
          },
          consumer: {
            groupId: 'payment-group',
          },
        },
      },
    ]),
  ],
  controllers: [PaymentEventController],
  providers: [PaymentService],
})
export class AppModule {}
