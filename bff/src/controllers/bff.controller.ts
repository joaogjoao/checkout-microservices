import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { CheckoutResponseDto } from 'src/dtos/checkout-response.dto';
import { CreateCheckoutResponseDto } from 'src/dtos/create-checkout-response.dto';
import { CreateCheckoutDto } from 'src/dtos/create-checkout.dto';
import { BffService } from 'src/services/bff.service';

@Controller('bff')
export class BffController {
  constructor(private readonly bff: BffService) { }

  @Post('checkout')
  @HttpCode(201)
  async createCheckout(@Body() dto: CreateCheckoutDto): Promise<CreateCheckoutResponseDto> {
    if (!dto || !dto.items || dto.items.length === 0) {
      throw new HttpException('Invalid checkout data', 400);
    }
    const response = await this.bff.createCheckout(dto);
    if (!response) {
      throw new HttpException('Checkout creation failed', 500);
    }
    return response;
  }

  @Post('shipping/:id/complete')
  @HttpCode(200)
  completeShipping(@Param('id') id: string) {
    return this.bff.completeShipping(id);
  }

  @Get('checkout/:id')
  @HttpCode(200)
  async getCheckout(@Param('id') id: string): Promise<CheckoutResponseDto> {
    if (!id) {
      throw new HttpException('Checkout ID is required', 400);
    }
    let checkout = await this.bff.getCheckout(id);
    if (!checkout) {
      throw new HttpException(`Checkout with ID ${id} not found`, 404);
    }
    return checkout;
  }

}