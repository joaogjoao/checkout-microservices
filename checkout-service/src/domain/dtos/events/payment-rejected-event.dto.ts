export interface PaymentRejectedEventDto {
  checkoutId: string;
  paymentId: string;
  reason: string;
  timestamp: string;
}