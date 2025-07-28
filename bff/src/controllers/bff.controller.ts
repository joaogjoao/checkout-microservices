import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
} from '@nestjs/common';
import { CreateCheckoutDto } from 'src/dtos/create-checkout.dto';
import { PaymentResponseDto } from 'src/dtos/payment-response.dto';
import { ShipmentResponseDto } from 'src/dtos/shipment-response.dto';
import { BffService } from 'src/services/bff.service';

@Controller('bff')
export class BffController {
  constructor(private readonly bff: BffService) {}
  
  // TESTE
  @Get('checkout')
  @HttpCode(201)
  gets() {
    console.log('GET /bff/checkout');
    return this.bff.createCheckouts();
  }

  // CHECKOUT
  @Post('checkout')
  @HttpCode(201)
  createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.bff.createCheckout(dto);
  }

  @Get('checkout/:id')
  getCheckout(@Param('id') id: string) {
    return this.bff.getCheckout(id);
  }

  @Get('payments/:id')
  getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.bff.getPayment(id);
  }

  @Get('shipments/:id')
  getShipment(@Param('id') id: string): Promise<ShipmentResponseDto> {
    return this.bff.getShipment(id);
  }
}
