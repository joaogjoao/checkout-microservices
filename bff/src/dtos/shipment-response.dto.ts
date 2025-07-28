import { IsString } from 'class-validator';

export class ShipmentResponseDto {
  @IsString()
  id: string;

  @IsString()
  checkoutId: string;

  @IsString()
  status: string;
}
