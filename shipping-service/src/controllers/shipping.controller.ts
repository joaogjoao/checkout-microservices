import { BadRequestException, Controller, HttpCode, HttpException, Param, Post } from '@nestjs/common';
import { ShippingService } from '../services/shipping.service';

@Controller()
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    @Post('shipping/:id/complete')
    @HttpCode(200)
    async completeShipping(@Param('id') id: string) {
        if (!id) {
            throw new BadRequestException('Shipping ID is required');
        }

        const message = await this.shippingService.completeShipping(id);

        return { message };

    }
}
