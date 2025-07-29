import { Body, Controller, Post, Get, Param, HttpException } from '@nestjs/common';
import { CheckoutService } from '../services/checkout.service';
import { CreateCheckoutDto } from '../domain/dtos/create-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private service: CheckoutService) {}

  @Post()
  async create(@Body() dto: CreateCheckoutDto) {
    if (!dto || !dto.items || dto.items.length === 0) {
      throw new HttpException('Invalid checkout data', 400);
    }
    const response = await this.service.createCheckout(dto);
    if (!response) {
      throw new HttpException('Checkout creation failed', 500);
    }
    return response;
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
