import { Controller, HttpCode, HttpException, Param, Post } from '@nestjs/common';
import { ShippingService } from '../services/shipping.service';

@Controller()
export class ShippingController {
    constructor(private readonly shippingService: ShippingService) { }

    @Post('shipping/:id/complete')
    @HttpCode(200)
    async completeShipping(@Param('id') id: string) {
        if (!id) {
            throw new HttpException('Shipping ID is required', 400);
        }
        const shipping = await this.shippingService.completeShipping(id);
        if (!shipping) {
            throw new HttpException(`Shipping with ID ${id} not found`, 404);
        }
        return shipping;

    }
}
