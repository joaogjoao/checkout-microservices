import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateCheckoutDto } from 'src/dtos/create-checkout.dto';
import { CreateCheckoutResponseDto } from 'src/dtos/create-checkout-response.dto';
import { CheckoutResponseDto } from 'src/dtos/checkout-response.dto';
import { BffService } from 'src/services/bff.service';

@ApiTags('BFF')
@Controller('bff')
export class BffController {
  constructor(private readonly bff: BffService) {}

  @Post('checkout')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new checkout' })
  @ApiBody({
    description: 'Payload to create a new checkout',
    type: CreateCheckoutDto,
    schema: {
      example: {
        items: [
          { productId: 'product-123', quantity: 2, unitPrice: 50.0 },
          { productId: 'product-456', quantity: 1, unitPrice: 100.0 }
        ],
        total: 200.0,
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        payment: {
          paymentMethod: 'pix',
          pixKey: 'user@example.com'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Checkout created successfully',
    type: CreateCheckoutResponseDto,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        total: 200.0,
        status: 'OPEN'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid checkout data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createCheckout(
    @Body() dto: CreateCheckoutDto
  ): Promise<CreateCheckoutResponseDto> {
    if (!dto?.items?.length) {
      throw new BadRequestException('Invalid checkout data');
    }
    const response = await this.bff.createCheckout(dto);
    if (!response) {
      throw new InternalServerErrorException('Checkout creation failed');
    }
    return response;
  }

  @Post('shipping/:id/complete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Complete shipping for an order' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the shipping to complete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping completed successfully',
    schema: {
      example: { message: 'Shipping completed successfully' }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid shipping ID or state' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async completeShipping(
    @Param('id') id: string
  ): Promise<{ message: string }> {
    if (!id) {
      throw new BadRequestException('Shipping ID is required');
    }
    const message = await this.bff.completeShipping(id);
    return { message };
  }

  @Get('checkout/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get checkout details by ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the checkout',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout details',
    type: CheckoutResponseDto,
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        total: 200.0,
        status: 'OPEN',
        createdAt: '2025-07-29T16:45:12.345Z',
        closedAt: null,
        paymentStatus: 'PENDING',
        shippingStatus: 'PENDING',
        paymentFailureReason: null,
        shippingId: null,
        trackingCode: null
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid checkout ID' })
  @ApiResponse({ status: 404, description: 'Checkout not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCheckout(
    @Param('id') id: string
  ): Promise<CheckoutResponseDto> {
    if (!id) {
      throw new BadRequestException('Checkout ID is required');
    }
    const checkout = await this.bff.getCheckout(id);
    if (!checkout) {
      throw new NotFoundException(`Checkout with ID ${id} not found`);
    }
    return checkout;
  }
}
