import { CheckoutStatus } from "../enums/checkout-status.enum";
import { PaymentStatus } from "../enums/payment-status.enum";
import { ShippingStatus } from "../enums/shipping-status.enum";

export class CheckoutResponseDto {
  id: string;
  status: CheckoutStatus;
  total: number;
  createdAt: Date;
  closedAt: Date | null;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  paymentFailureReason?: string;
  shippingId?: string;
  trackingCode?: string;
}