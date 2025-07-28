import { IsArray, ValidateNested, IsNumber, IsString, ValidateIf, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CreateCheckoutItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateAddressDto {
  @IsString()
  street: string;
  @IsString()
  city: string;
  @IsString()
  state: string;
  @IsString()
  zip: string;
  @IsString()
  country: string;
}

export class CreatePaymentDto {
  @IsEnum(PaymentMethod, { message: 'paymentMethod must be a valid PaymentMethod' })
  paymentMethod: PaymentMethod;

  @ValidateIf(o => o.paymentMethod === PaymentMethod.CREDIT_CARD)
  @IsString()
  cardNumber?: string;

  @ValidateIf(o => o.paymentMethod === PaymentMethod.PIX)
  @IsString()
  pixKey?: string;

  @ValidateIf(o => o.paymentMethod === PaymentMethod.DEBIT)
  @IsString()
  debitAccount?: string;
}

export class CreateCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCheckoutItemDto)
  items: CreateCheckoutItemDto[];

  @IsNumber()
  total: number;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @ValidateNested()
  @Type(() => CreatePaymentDto)
  payment: CreatePaymentDto;
}
