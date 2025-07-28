import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
} from '@nestjs/common';
import { CreateCheckoutDto } from 'src/dtos/create-checkout.dto';
import { BffService } from 'src/services/bff.service';

@Controller('bff')
export class BffController {
  constructor(private readonly bff: BffService) { }

  @Post('checkout')
  @HttpCode(201)
  createCheckout(@Body() dto: CreateCheckoutDto) {
    console.log('Creating checkout with DTO:', dto);
    return this.bff.createCheckout(dto);
  }

  @Post('shipping/:id/complete')
  @HttpCode(200)
  completeShipping(@Param('id') id: string) {
    return this.bff.completeShipping(id);
  }

  @Get('checkout/:id')
  @HttpCode(200)
  getCheckout(@Param('id') id: string) {
    return this.bff.getCheckout(id);
  }

}
