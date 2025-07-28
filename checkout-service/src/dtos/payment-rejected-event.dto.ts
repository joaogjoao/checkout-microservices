export class PaymentRejectedEventDto {
  checkoutId: string;
  paymentId: string;
  reason: string;
  timestamp: string;
}
