import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka, KafkaContext } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Payment } from '../entities/payment.entity';
import { CheckoutCreatedMessageDto } from '../dtos/checkout-created-message.dto';
import { PaymentApprovedEventDto } from '../dtos/payment-approved-event.dto';
import { PaymentRejectedEventDto } from '../dtos/payment-rejected-event.dto';

@Injectable()
export class PaymentService implements OnModuleInit {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        @Inject('KAFKA_SERVICE')
        private readonly kafkaClient: ClientKafka,
    ) { }

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async processCheckout(msg: CheckoutCreatedMessageDto) {
        const approved = msg.total < 1000;

        const payment = this.paymentRepo.create({
            checkoutId: msg.id,
            amount: msg.total,
            status: approved ? 'approved' : 'rejected',
            reason: approved ? undefined : 'Valor acima do limite',
        });
        
        const saved = await this.paymentRepo.save(payment);

        if (approved) {
            const event: PaymentApprovedEventDto = {
                checkoutId: saved.checkoutId,
                paymentId: saved.id,
                amount: Number(saved.amount),
                timestamp: new Date().toISOString(),
            };
            console.log(`Emitting payment.approved: ${JSON.stringify(event)}`);
            this.kafkaClient.emit('payment.approved', event);
        } else {
            const event: PaymentRejectedEventDto = {
                checkoutId: saved.checkoutId,
                paymentId: saved.id,
                reason: saved.reason!,
                timestamp: new Date().toISOString(),
            };
            console.log(`Emitting payment.rejected: ${JSON.stringify(event)}`);
            this.kafkaClient.emit('payment.rejected', event);
        }
    }
}
