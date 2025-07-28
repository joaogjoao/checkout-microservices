import { PaymentInfo } from '../dtos/checkout-created-message.dto';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentProcessor } from './payment-processor.interface';

const MAX_AMOUNT = 1000;

export class CreditCardProcessor implements PaymentProcessor {
    async process(paymentInfo: PaymentInfo, amount: number) {
        if (paymentInfo.cardNumber && amount < MAX_AMOUNT) {
            return { status: PaymentStatus.APPROVED };
        }
        return { status: PaymentStatus.REJECTED, reason: 'Amount too high, max(' + MAX_AMOUNT + ')' };
    }
}