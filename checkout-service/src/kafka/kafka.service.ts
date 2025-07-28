// checkout-service/src/kafka/kafka.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { CheckoutCreatedMessage } from 'src/dtos/checkout-created-message.dto';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private kafka = new Kafka({
        brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS ?? "kafka:9092"],
    });
    private producer: Producer = this.kafka.producer();

    async onModuleInit() {
        await this.producer.connect();
    }

    async onModuleDestroy() {
        await this.producer.disconnect();
    }

    async emit(topic: string, message: CheckoutCreatedMessage): Promise<void> {
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
    }
}
