import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Payment } from '../domain/entities/payment.entity';
import { CheckoutCreatedMessageDto } from '../domain/dtos/checkout-created-message.dto';
import { PaymentApprovedEventDto } from '../domain/dtos/payment-approved-event.dto';
import { PaymentRejectedEventDto } from '../domain/dtos/payment-rejected-event.dto';
import { PaymentProcessorFactory } from 'src/domain/payments/payment-processor.factory';
import { PaymentStatus } from 'src/domain/enums/payment-status.enum';

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

    async processCheckoutPayment(checkout: CheckoutCreatedMessageDto) {
        const payment = this.createPaymentFromCheckout(checkout);
        const processor = PaymentProcessorFactory.getProcessor(checkout.paymentMethod);
        const paymentResult = await processor.process(checkout.paymentInfo, checkout.total);

        payment.status = paymentResult.status;
        payment.reason = paymentResult.reason;
        
        const saved = await this.paymentRepo.save(payment);

        if (saved.status === PaymentStatus.APPROVED) {
            const event: PaymentApprovedEventDto = this.createPaymentApprovedMessage(saved);
            this.kafkaClient.emit('payment.approved', event);
        } else {
            const event: PaymentRejectedEventDto = this.createPaymentRejectedMessage(saved);
            this.kafkaClient.emit('payment.rejected', event);
        }
    }

    private createPaymentFromCheckout(msg: CheckoutCreatedMessageDto): Payment {
        const payment = this.paymentRepo.create({
            checkoutId: msg.id,
            amount: msg.total,
            paymentMethod: msg.paymentMethod
        });
        return payment;
    }

    private createPaymentRejectedMessage(saved: Payment): PaymentRejectedEventDto {
        const event: PaymentRejectedEventDto = {
            checkoutId: saved.checkoutId,
            paymentId: saved.id,
            reason: saved.reason || "No reason provided",
            timestamp: new Date().toISOString(),
        };
        return event;
    }

    private createPaymentApprovedMessage(saved: Payment): PaymentApprovedEventDto {
        const event: PaymentApprovedEventDto = {
            checkoutId: saved.checkoutId,
            paymentId: saved.id,
            amount: Number(saved.amount),
            timestamp: new Date().toISOString(),
        };
        return event;
    }


}
