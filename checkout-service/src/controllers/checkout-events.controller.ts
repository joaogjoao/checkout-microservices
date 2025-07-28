import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { CheckoutService } from '../services/checkout.service';
import { PaymentRejectedEventDto } from '../dtos/payment-rejected-event.dto';
import { ShippingCompletedEventDto } from '../dtos/shipping-completed-event.dto';

@Controller()
export class CheckoutEventsController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @EventPattern('payment.rejected')
  handlePaymentRejected(
    @Payload() data: PaymentRejectedEventDto,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Payment rejected event received:', data);
    return this.checkoutService.handlePaymentRejected(data);
  }

  @EventPattern('shipping.completed')
  handleShippingCompleted(
    @Payload() data: ShippingCompletedEventDto,
    @Ctx() context: KafkaContext,
  ) {
    console.log('Shipping completed event received:', data);
    return this.checkoutService.handleShippingCompleted(data);
  }
}
