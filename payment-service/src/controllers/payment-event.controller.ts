import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { CheckoutCreatedMessageDto } from '../domain/dtos/checkout-created-message.dto';
import { PaymentService } from 'src/services/payment.service';

@Controller()
export class PaymentEventController {
  private readonly logger = new Logger(PaymentEventController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('checkout.created')
  async handleCheckoutCreated(
    @Payload() message: CheckoutCreatedMessageDto,
    @Ctx() context: KafkaContext,
  ) {
    console.debug(`Received checkout.created: ${JSON.stringify(message)}`);
    await this.paymentService.processCheckoutPayment(message);
  }
}
