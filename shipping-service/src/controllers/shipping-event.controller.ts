import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ShippingService } from '../services/shipping.service';
import { PaymentApprovedEventDto } from '../dtos/payment-approved-event.dto';

@Controller()
export class ShippingEventController {
    constructor(private readonly shippingService: ShippingService) { }

    @EventPattern('payment.approved')
    async handlePaymentApproved(
        @Payload() message: PaymentApprovedEventDto,
    ) {
        // usamos paymentId vindo do evento para criar o shipping
        console.log('Payment approved event received:', message);
        await this.shippingService.createShipping(
            message.checkoutId,
            message.paymentId,
        );
    }
}
