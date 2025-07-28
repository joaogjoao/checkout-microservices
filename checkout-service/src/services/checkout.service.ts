import { Injectable, Inject, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkout, CheckoutStatus } from '../entities/checkout.entity';
import { CreateCheckoutDto } from '../dtos/create-checkout.dto';
import { v4 as uuid } from 'uuid';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentRejectedEventDto } from 'src/dtos/payment-rejected-event.dto';
import { ShippingCompletedEventDto } from 'src/dtos/shipping-completed-event.dto';
import { CheckoutCreatedMessage } from 'src/dtos/checkout-created-message.dto';

@Injectable()
export class CheckoutService implements OnModuleInit {
  constructor(
    @InjectRepository(Checkout)
    private repo: Repository<Checkout>,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) { }

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async createCheckout(dto: CreateCheckoutDto): Promise<Checkout> {
    const entity = this.repo.create({ id: uuid(), ...dto});
    const saved = await this.repo.save(entity);
    console.log('Checkout created:', saved);

    const message: CheckoutCreatedMessage = {
      id: saved.id,
      items: saved.items,
      total: saved.total,
      address: saved.address,
      status: saved.status,
    };
    
    await this.kafkaClient.emit('checkout.created', message);

    return saved;
  }

  async findById(id: string): Promise<Checkout> {
    const checkout = await this.repo.findOneBy({ id });
    if (!checkout) throw new NotFoundException(`Checkout ${id} não encontrado`);
    return checkout;
  }

  async handlePaymentRejected(event: PaymentRejectedEventDto): Promise<Checkout> {
    const { checkoutId, reason } = event;
    const checkout = await this.repo.findOne({ where: { id: checkoutId } });
    if (!checkout) throw new NotFoundException(`Checkout ${checkoutId} não encontrado`);

    checkout.status = CheckoutStatus.PAYMENT_REJECTED;
    checkout.paymentReason = reason;
    return this.repo.save(checkout);
  }

  async handleShippingCompleted(event: ShippingCompletedEventDto): Promise<Checkout> {
    const { checkoutId, trackingCode } = event;
    const checkout = await this.repo.findOne({ where: { id: checkoutId } });
    if (!checkout) throw new NotFoundException(`Checkout ${checkoutId} não encontrado`);

    checkout.status = CheckoutStatus.COMPLETED;
    checkout.trackingCode = trackingCode;
    return this.repo.save(checkout);
  }
}
