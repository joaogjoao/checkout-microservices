import { PaymentMethod } from "../../enums/payment-method.enum";

export interface CheckoutCreatedMessage {
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