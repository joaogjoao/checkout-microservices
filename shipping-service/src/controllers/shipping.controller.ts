import { Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ShippingService } from '../services/shipping.service';

@Controller()
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    @Post('shipping/:id/complete')
    @HttpCode(200)
    async completeShipping(@Param('id') id: string) {
        return this.shippingService.completeShipping(id);
    }
}
