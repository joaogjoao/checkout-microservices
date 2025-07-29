import { ApiProperty } from '@nestjs/swagger';
import { CheckoutStatus } from '../enums/checkout-status.enum';

export class CreateCheckoutResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the created checkout',
  })
  id: string;

  @ApiProperty({
    enum: CheckoutStatus,
    example: CheckoutStatus.OPEN,
    description: 'Current status of the checkout',
  })
  status: CheckoutStatus;

  @ApiProperty({
    example: 150.0,
    description: 'Total amount for the checkout',
  })
  total: number;
}
