import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { CheckoutService } from '../services/checkout.service';
import { PaymentRejectedEventDto } from '../domain/dtos/events/payment-rejected-event.dto';
import { ShippingCompletedEventDto } from '../domain/dtos/events/shipping-completed-event.dto';
import { PaymentApprovedEventDto } from 'src/domain/dtos/events/payment-approved-event.dto';
import { ShippingEventDto } from 'src/domain/dtos/events/shipping-event.dto';

@Controller()
export class CheckoutEventsController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @EventPattern('payment.rejected')
  handlePaymentRejected(
    @Payload() data: PaymentRejectedEventDto,
    @Ctx() context: KafkaContext,
  ) {
    return this.checkoutService.handlePaymentRejected(data);
  }
  
  @EventPattern('payment.approved')
  handlePaymentApproved (
    @Payload() data: PaymentApprovedEventDto,
    @Ctx() context: KafkaContext,
  ) {
    return this.checkoutService.handlePaymentApproved(data);
  }

  @EventPattern('shipping.created')
  handleShipped(
    @Payload() data: ShippingEventDto,
    @Ctx() context: KafkaContext,
  ) {
    return this.checkoutService.handleShipped(data);
  }

  @EventPattern('shipping.completed')
  handleShippingCompleted(
    @Payload() data: ShippingCompletedEventDto,
    @Ctx() context: KafkaContext,
  ) {
    return this.checkoutService.handleShippingCompleted(data);
  }
}
