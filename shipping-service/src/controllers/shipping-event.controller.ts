import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ShippingService } from '../services/shipping.service';
import { CheckoutPaidEventDto } from 'src/dtos/checkout-paid-event.dto';

@Controller()
export class ShippingEventController {
    constructor(private readonly shippingService: ShippingService) { }

    @EventPattern('checkout.paid')
    async handleCheckoutPaymentApproved(
        @Payload() message: CheckoutPaidEventDto,
    ) {
        await this.shippingService.createShipping(message);
    }
}
