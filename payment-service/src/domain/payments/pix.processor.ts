import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentProcessor } from './payment-processor.interface';

const MAX_AMOUNT = 1000;

export class PixProcessor implements PaymentProcessor {
    async process(paymentInfo: any, amount: number) {
        if (paymentInfo.pixKey && amount < MAX_AMOUNT) {
            return { status: PaymentStatus.APPROVED };
        }
        return { status: PaymentStatus.REJECTED, reason: 'Amount too high, max(' + MAX_AMOUNT + ')' };
    }
}