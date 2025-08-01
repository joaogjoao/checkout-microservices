import { Injectable, Inject, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkout } from '../domain/entities/checkout.entity';
import { CreateCheckoutDto } from '../domain/dtos/create-checkout.dto';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentRejectedEventDto } from '../domain/dtos/events/payment-rejected-event.dto';
import { ShippingCompletedEventDto } from '../domain/dtos/events/shipping-completed-event.dto';
import { CheckoutCreatedMessage } from '../domain/dtos/messages/checkout-created-message.dto';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { PaymentApprovedEventDto } from '../domain/dtos/events/payment-approved-event.dto';
import { CheckoutPaidMessage } from '../domain/dtos/messages/checkout-paid-message.dto';
import { Address } from '../domain/entities/address.entity';
import { CheckoutStatus } from '../domain/enums/checkout-status.enum';
import { ShippingStatus } from '../domain/enums/shipping-status.enum';
import { ShippingEventDto } from '../domain/dtos/events/shipping-event.dto';
import { CheckoutResponseDto } from '../domain/dtos/checkout-response.dto';
import { CreateCheckoutResponseDto } from '../domain/dtos/create-checkout-response.dto';

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

  async createCheckout(dto: CreateCheckoutDto): Promise<CreateCheckoutResponseDto | null> {
    try {
      const checkout = this.createCheckoutFromDto(dto);

      const saved = await this.repo.save(checkout);

      const message: CheckoutCreatedMessage = this.createCheckoutMessage(saved, dto);

      this.kafkaClient.emit('checkout.created', message);

       return {
                id: saved.id,
                status: saved.status,
                total: saved.total
            };
    } catch (error) {
      return null;
    }
  }

  async findById(id: string): Promise<CheckoutResponseDto> {
    try {
      const checkout = await this.repo.findOne({
        where: { id }
      });
      if (!checkout) throw new NotFoundException(`Checkout ${id} not found`);

      return {
        id: checkout.id,
        status: checkout.status,
        total: checkout.total,
        createdAt: checkout.createdAt,
        closedAt: checkout.closedAt,
        paymentStatus: checkout.paymentStatus,
        shippingStatus: checkout.shippingStatus,
        paymentFailureReason: checkout.paymentFailureReason,
        shippingId: checkout.shippingId,
        trackingCode: checkout.trackingCode,
      };
    } catch (error) {
      throw new NotFoundException(`Checkout ${id} not found`);
    }
  }

  async handlePaymentRejected(event: PaymentRejectedEventDto): Promise<string> {
    const checkout = await this.repo.findOne({
      where: { id: event.checkoutId }
    });
    if (!checkout) throw new NotFoundException(`Checkout ${event.checkoutId} not found`);

    checkout.paymentFailureReason = event.reason;
    checkout.paymentStatus = PaymentStatus.REJECTED;
    checkout.status = CheckoutStatus.OPEN;

    await this.repo.save(checkout);
    return "Payment rejected";
  }

  async handlePaymentApproved(event: PaymentApprovedEventDto): Promise<string> {
    const checkout = await this.repo.findOne({
      where: { id: event.checkoutId },
      relations: ['address'],
    });
    if (!checkout) throw new NotFoundException(`Checkout ${event.checkoutId} not found`);

    checkout.paymentStatus = PaymentStatus.APPROVED;

    await this.repo.save(checkout);
    const message: CheckoutPaidMessage = this.createCheckoutPaidMessage(event, checkout.address);
    this.kafkaClient.emit('checkout.paid', message);
    return "Payment approved and checkout updated successfully";
  }

  async handleShipped(event: ShippingEventDto): Promise<string> {
    const checkout = await this.repo.findOne({
      where: { id: event.checkoutId }
    });
    if (!checkout) throw new NotFoundException(`Checkout ${event.checkoutId} not found`);

    checkout.shippingStatus = ShippingStatus.SHIPPED;
    checkout.trackingCode = event.trackingCode;
    checkout.shippingId = event.shippingId;
    await this.repo.save(checkout);
    return "Shipping event processed successfully";
  }

  async handleShippingCompleted(event: ShippingCompletedEventDto): Promise<string> {
    const checkout = await this.repo.findOne({
      where: { id: event.checkoutId }
    });
    if (!checkout) throw new NotFoundException(`Checkout ${event.checkoutId} not found`);

    checkout.status = CheckoutStatus.COMPLETED;
    checkout.shippingStatus = ShippingStatus.DELIVERED;
    checkout.closedAt = new Date();
    await this.repo.save(checkout);
    return "Shipping completed and checkout updated successfully";
  }

  private createCheckoutFromDto(dto: CreateCheckoutDto): Checkout {
    const checkout = this.repo.create({
      total: dto.total,
      items: dto.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      address: {
        ...dto.address,
      },
    });
    return checkout;
  }

  private createCheckoutMessage(saved: Checkout, dto: CreateCheckoutDto): CheckoutCreatedMessage {
    const message: CheckoutCreatedMessage = {
      id: saved.id,
      total: saved.total,
      paymentMethod: dto.payment.paymentMethod,
      paymentInfo: {
        cardNumber: dto.payment.cardNumber,
        pixKey: dto.payment.pixKey,
        debitAccount: dto.payment.debitAccount,
      }
    };
    return message;
  }

  private createCheckoutPaidMessage(event: PaymentApprovedEventDto, address: Address): CheckoutPaidMessage {
    const message: CheckoutPaidMessage = {
      id: event.checkoutId,
      address: address
    };

    return message;
  }

}


