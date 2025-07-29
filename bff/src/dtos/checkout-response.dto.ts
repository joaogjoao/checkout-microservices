import { ApiProperty } from '@nestjs/swagger';
import { CheckoutStatus } from '../enums/checkout-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class CheckoutResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the checkout',
  })
  id: string;

  @ApiProperty({
    enum: CheckoutStatus,
    example: CheckoutStatus.OPEN,
    description: 'Overall status of the checkout',
  })
  status: CheckoutStatus;

  @ApiProperty({
    example: 150.0,
    description: 'Total amount for the checkout',
  })
  total: number;

  @ApiProperty({
    example: '2025-07-29T16:45:12.345Z',
    description: 'Timestamp when the checkout was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: null,
    description: 'Timestamp when the checkout was closed, or null if still open',
    nullable: true,
  })
  closedAt: Date | null;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    description: 'Current payment status',
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    enum: ShippingStatus,
    example: ShippingStatus.PENDING,
    description: 'Current shipping status',
  })
  shippingStatus: ShippingStatus;

  @ApiProperty({
    example: 'Card was declined',
    description: 'Reason for payment failure, if any',
    required: false,
  })
  paymentFailureReason?: string;

  @ApiProperty({
    example: 'ship-123e4567',
    description: 'Identifier of the shipping record, if created',
    required: false,
  })
  shippingId?: string;

  @ApiProperty({
    example: 'TRACK123456789',
    description: 'Tracking code assigned to the shipment, if available',
    required: false,
  })
  trackingCode?: string;
}
