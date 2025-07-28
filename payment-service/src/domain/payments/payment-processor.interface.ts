import { PaymentInfo } from "../dtos/checkout-created-message.dto";
import { PaymentStatus } from "../enums/payment-status.enum";

export interface PaymentResult {
    status: PaymentStatus;
    reason?: string
}

export interface PaymentProcessor {
    process(paymentInfo: PaymentInfo, amount: number): Promise<PaymentResult>;
    validate?(): boolean
}