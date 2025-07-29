import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  ValidateIf,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
  DEBIT = 'debit',
}

export class CreateCheckoutItemDto {
  @ApiProperty({ example: 'product-123', description: 'The unique identifier of the product' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity of the product to purchase' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 50.0, description: 'Unit price of the product' })
  @IsNumber()
  unitPrice: number;
}

export class CreateAddressDto {
  @ApiProperty({ example: '123 Main St', description: 'Street address' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'New York', description: 'City name' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY', description: 'State or province' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001', description: 'Postal or ZIP code' })
  @IsString()
  zip: string;

  @ApiProperty({ example: 'USA', description: 'Country name' })
  @IsString()
  country: string;
}

export class CreatePaymentDto {
  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
    description: 'The payment method used for this checkout',
  })
  @IsEnum(PaymentMethod, {
    message: 'paymentMethod must be one of the defined PaymentMethod values',
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: '4111111111111111',
    description: 'Credit card number (required if paymentMethod is CREDIT_CARD)',
    required: false,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.CREDIT_CARD)
  @IsString()
  cardNumber?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'PIX key (required if paymentMethod is PIX)',
    required: false,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.PIX)
  @IsString()
  pixKey?: string;

  @ApiProperty({
    example: '00012345-6',
    description: 'Debit account number (required if paymentMethod is DEBIT)',
    required: false,
  })
  @ValidateIf((o) => o.paymentMethod === PaymentMethod.DEBIT)
  @IsString()
  debitAccount?: string;
}

export class CreateCheckoutDto {
  @ApiProperty({
    type: [CreateCheckoutItemDto],
    description: 'List of items to include in the checkout',
    example: [
      { productId: 'product-123', quantity: 2, unitPrice: 50.0 },
      { productId: 'product-456', quantity: 1, unitPrice: 100.0 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCheckoutItemDto)
  items: CreateCheckoutItemDto[];

  @ApiProperty({ example: 200.0, description: 'Total amount for the checkout' })
  @IsNumber()
  total: number;

  @ApiProperty({
    type: CreateAddressDto,
    description: 'Shipping address for the order',
    example: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ApiProperty({
    type: CreatePaymentDto,
    description: 'Payment details for the checkout',
    example: {
      paymentMethod: PaymentMethod.PIX,
      pixKey: 'user@example.com',
    },
  })
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  payment: CreatePaymentDto;
}
