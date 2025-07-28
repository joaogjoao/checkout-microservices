import { PaymentMethod } from "../enums/payment-method.enum";

export interface CheckoutCreatedMessageDto {
  id: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentInfo: PaymentInfo;
}

export interface PaymentInfo {
  cardNumber?: string;
  pixKey?: string;
  debitAccount?: string;
}