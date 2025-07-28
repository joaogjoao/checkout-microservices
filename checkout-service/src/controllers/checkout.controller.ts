import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CheckoutService } from '../services/checkout.service';
import { CreateCheckoutDto } from '../domain/dtos/create-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private service: CheckoutService) {}

  @Post()
  async create(@Body() dto: CreateCheckoutDto) {
    return this.service.createCheckout(dto);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
