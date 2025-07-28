import { IsString, IsNumber } from 'class-validator';

export class PaymentResponseDto {
  @IsString()
  id: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;
}
