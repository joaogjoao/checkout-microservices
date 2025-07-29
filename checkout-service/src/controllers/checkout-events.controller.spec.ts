import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutEventsController } from '../controllers/checkout-events.controller';
import { CheckoutService } from '../services/checkout.service';
import { KafkaContext } from '@nestjs/microservices';
import { PaymentRejectedEventDto } from '../domain/dtos/events/payment-rejected-event.dto';
import { PaymentApprovedEventDto } from '../domain/dtos/events/payment-approved-event.dto';
import { ShippingEventDto } from '../domain/dtos/events/shipping-event.dto';
import { ShippingCompletedEventDto } from '../domain/dtos/events/shipping-completed-event.dto';

describe('CheckoutEventsController', () => {
  let controller: CheckoutEventsController;
  let service: CheckoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutEventsController],
      providers: [
        {
          provide: CheckoutService,
          useValue: {
            handlePaymentRejected: jest.fn(),
            handlePaymentApproved: jest.fn(),
            handleShipped: jest.fn(),
            handleShippingCompleted: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CheckoutEventsController>(CheckoutEventsController);
    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handlePaymentRejected', () => {
    it('should delegate to service.handlePaymentRejected', async () => {
      const dto: PaymentRejectedEventDto = {
        checkoutId: 'chk-1',
        reason: 'Card declined',
        timestamp: '2025-07-29T10:00:00Z',
        paymentId: 'pay-123'
      };
      const ctx = {} as KafkaContext;
      const result = "Payment rejected";
      jest.spyOn(service, 'handlePaymentRejected').mockResolvedValue(result);

      await expect(controller.handlePaymentRejected(dto, ctx)).resolves.toBe(result);
      expect(service.handlePaymentRejected).toHaveBeenCalledWith(dto);
    });
  });

  describe('handlePaymentApproved', () => {
    it('should delegate to service.handlePaymentApproved', async () => {
      const dto: PaymentApprovedEventDto = {
        checkoutId: 'chk-2',
        paymentId: 'pay-123',
        amount: 200,
        timestamp: '2025-07-29T12:00:00Z',
      };
      const ctx = {} as KafkaContext;
      const result = "Payment approved and checkout updated successfully";
      jest.spyOn(service, 'handlePaymentApproved').mockResolvedValue(result);

      await expect(controller.handlePaymentApproved(dto, ctx)).resolves.toBe(result);
      expect(service.handlePaymentApproved).toHaveBeenCalledWith(dto);
    });
  });

  describe('handleShipped', () => {
    it('should delegate to service.handleShipped', async () => {
      const dto: ShippingEventDto = {
        checkoutId: 'chk-3',
        shippingId: 'ship-456',
        trackingCode: '2AB3C4D5E6F7',
      };
      const ctx = {} as KafkaContext;
      const result = "Shipping event processed successfully";
      jest.spyOn(service, 'handleShipped').mockResolvedValue(result);

      await expect(controller.handleShipped(dto, ctx)).resolves.toBe(result);
      expect(service.handleShipped).toHaveBeenCalledWith(dto);
    });
  });

  describe('handleShippingCompleted', () => {
    it('should delegate to service.handleShippingCompleted', async () => {
      const dto: ShippingCompletedEventDto = {
        checkoutId: 'chk-4',
        shippingId: '2025-07-30T09:00:00Z',
        deliveredAt: '2025-07-30T09:00:00Z'
      };
      const ctx = {} as KafkaContext;
      const result = "Shipping completed and checkout updated successfully";
      jest.spyOn(service, 'handleShippingCompleted').mockResolvedValue(result);

      await expect(controller.handleShippingCompleted(dto, ctx)).resolves.toBe(result);
      expect(service.handleShippingCompleted).toHaveBeenCalledWith(dto);
    });
  });
});
