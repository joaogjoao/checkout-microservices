import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsArray()
  items: string[];

  @IsNumber()
  total: number;

  @IsString()
  address: string;
}
