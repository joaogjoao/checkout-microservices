import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentProcessor } from './payment-processor.interface';
import { CreditCardProcessor } from './credit-card.processor';
import { PixProcessor } from './pix.processor';
import { DebitCardProcessor } from './debit-card.processor';

export class PaymentProcessorFactory {
  static getProcessor(method: PaymentMethod): PaymentProcessor {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return new CreditCardProcessor();
      case PaymentMethod.DEBIT:
        return new DebitCardProcessor();
      case PaymentMethod.PIX:
        return new PixProcessor();
      default:
        throw new Error('Not supported payment method');
    }
  }
}