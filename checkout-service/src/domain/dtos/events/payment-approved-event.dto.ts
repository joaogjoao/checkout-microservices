export interface PaymentApprovedEventDto {
  checkoutId: string;
  paymentId: string;
  amount: number;
  timestamp: string;
}
