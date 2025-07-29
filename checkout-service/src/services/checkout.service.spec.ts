import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from '../services/checkout.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Checkout } from '../domain/entities/checkout.entity';
import { CreateCheckoutDto } from '../domain/dtos/create-checkout.dto';
import { CheckoutCreatedMessage } from '../domain/dtos/messages/checkout-created-message.dto';
import { CheckoutResponseDto } from '../domain/dtos/checkout-response.dto';
import { PaymentRejectedEventDto } from '../domain/dtos/events/payment-rejected-event.dto';
import { PaymentApprovedEventDto } from '../domain/dtos/events/payment-approved-event.dto';
import { ShippingEventDto } from '../domain/dtos/events/shipping-event.dto';
import { ShippingCompletedEventDto } from '../domain/dtos/events/shipping-completed-event.dto';
import { NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { CheckoutStatus } from '../domain/enums/checkout-status.enum';
import { ShippingStatus } from '../domain/enums/shipping-status.enum';
import { PaymentMethod } from '../domain/enums/payment-method.enum';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let repo: Repository<Checkout>;
  let kafkaClient: ClientKafka;

  const repoMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const kafkaMock = {
    connect: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: getRepositoryToken(Checkout), useValue: repoMock },
        { provide: 'KAFKA_SERVICE', useValue: kafkaMock },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    repo = module.get<Repository<Checkout>>(getRepositoryToken(Checkout));
    kafkaClient = module.get<ClientKafka>('KAFKA_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call kafkaClient.connect', async () => {
      await service.onModuleInit();
      expect(kafkaMock.connect).toHaveBeenCalled();
    });
  });

  describe('createCheckout', () => {
    it('should save checkout, emit event and return response', async () => {
      const dto: CreateCheckoutDto = {
        items: [{ productId: '1', quantity: 2, unitPrice: 50 }],
        total: 100,
        address: { street: 'Rua A', city: 'X', state: 'S', zip: '00000', country: 'BR' },
        payment: { paymentMethod: PaymentMethod.CREDIT_CARD, pixKey: undefined, cardNumber: "undefined", debitAccount: undefined },
      };
      const saved = {
        id: 'chk-1',
        total: 100,
        status: CheckoutStatus.OPEN,
      } as Checkout;
      repoMock.create.mockReturnValue(saved);
      repoMock.save.mockResolvedValue(saved);

      const result = await service.createCheckout(dto);
      expect(repoMock.create).toHaveBeenCalledWith({
        total: dto.total,
        items: dto.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        address: dto.address,
      });
      expect(repoMock.save).toHaveBeenCalledWith(saved);

      const expectedMessage: CheckoutCreatedMessage = {
        id: saved.id,
        total: saved.total,
        paymentMethod: dto.payment.paymentMethod,
        paymentInfo: {
          cardNumber: dto.payment.cardNumber,
          pixKey: dto.payment.pixKey,
          debitAccount: dto.payment.debitAccount,
        },
      };
      expect(kafkaMock.emit).toHaveBeenCalledWith('checkout.created', expectedMessage);

      expect(result).toEqual({ id: saved.id, status: saved.status, total: saved.total });
    });

    it('should return null on error', async () => {
      repoMock.create.mockImplementation(() => { throw new Error(); });
      const dto = {} as CreateCheckoutDto;
      const result = await service.createCheckout(dto);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a CheckoutResponseDto when found', async () => {
      const entity = new Checkout();
      entity.id = 'chk-2';
      entity.total = 50;
      entity.status = CheckoutStatus.OPEN;
      entity.createdAt = new Date();
      entity.paymentStatus = PaymentStatus.PENDING;
      entity.shippingStatus = ShippingStatus.PENDING;

      repoMock.findOne.mockResolvedValue(entity);

      const result = await service.findById(entity.id);
      const expected: CheckoutResponseDto = {
        id: entity.id,
        total: entity.total,
        status: entity.status,
        createdAt: entity.createdAt,
        closedAt: entity.closedAt,
        paymentStatus: entity.paymentStatus,
        shippingStatus: entity.shippingStatus,
        paymentFailureReason: entity.paymentFailureReason,
        shippingId: entity.shippingId,
        trackingCode: entity.trackingCode,
      };
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      repoMock.findOne.mockResolvedValue(null);
      await expect(service.findById('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('handlePaymentRejected', () => {
    it('should update status and save', async () => {
      const event: PaymentRejectedEventDto = { checkoutId: 'chk-3', reason: 'fail', timestamp: '2025-07-29T10:00:00Z', paymentId: 'pay-123' };
      const entity = new Checkout();
      entity.id = event.checkoutId;
      entity.total = 50;
      entity.status = CheckoutStatus.OPEN;
      entity.createdAt = new Date();
      entity.paymentStatus = PaymentStatus.PENDING;
      entity.shippingStatus = ShippingStatus.PENDING;
      repoMock.findOne.mockResolvedValue(entity);
      repoMock.save.mockResolvedValue(entity);

      const result = await service.handlePaymentRejected(event);
      expect(entity.paymentStatus).toBe(PaymentStatus.REJECTED);
      expect(entity.paymentFailureReason).toBe(event.reason);
      expect(entity.status).toBe(CheckoutStatus.OPEN);
      expect(repoMock.save).toHaveBeenCalledWith(entity);
      expect(result).toBe('Payment rejected');
    });

    it('should throw if checkout not found', async () => {
      repoMock.findOne.mockResolvedValue(null);
      await expect(service.handlePaymentRejected({ checkoutId: 'x', reason: '', timestamp: '', paymentId: '' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('handlePaymentApproved', () => {
    it('should update status, save and emit event', async () => {
      const event: PaymentApprovedEventDto = { checkoutId: 'chk-4', paymentId: 'p1', amount: 10, timestamp: 't' };
      const address = { street: 'A' } as any;
      const entity = new Checkout();
      entity.id = event.checkoutId;
      entity.total = 50;
      entity.status = CheckoutStatus.OPEN;
      entity.createdAt = new Date();
      entity.paymentStatus = PaymentStatus.PENDING;
      entity.shippingStatus = ShippingStatus.PENDING;
      entity.address = address;
      
      repoMock.findOne.mockResolvedValue(entity);
      repoMock.save.mockResolvedValue(entity);

      const result = await service.handlePaymentApproved(event);
      expect(entity.paymentStatus).toBe(PaymentStatus.APPROVED);
      expect(repoMock.save).toHaveBeenCalledWith(entity);
      const expectedMsg = { id: event.checkoutId, address };
      expect(kafkaMock.emit).toHaveBeenCalledWith('checkout.paid', expectedMsg);
      expect(result).toBe('Payment approved and checkout updated successfully');
    });

    it('should throw if checkout not found', async () => {
      repoMock.findOne.mockResolvedValue(null);
      await expect(service.handlePaymentApproved({ checkoutId: 'x', paymentId: '', amount: 0, timestamp: '' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('handleShipped', () => {
    it('should update shipping fields and save', async () => {
      const event: ShippingEventDto = { checkoutId: 'chk-5', shippingId: 's1', trackingCode: 't1' };
      const entity = {} as Checkout;
      repoMock.findOne.mockResolvedValue(entity);
      repoMock.save.mockResolvedValue(entity);

      const result = await service.handleShipped(event);
      expect(entity.shippingStatus).toBe(ShippingStatus.SHIPPED);
      expect(entity.shippingId).toBe(event.shippingId);
      expect(entity.trackingCode).toBe(event.trackingCode);
      expect(repoMock.save).toHaveBeenCalledWith(entity);
      expect(result).toBe('Shipping event processed successfully');
    });

    it('should throw if checkout not found', async () => {
      repoMock.findOne.mockResolvedValue(null);
      await expect(service.handleShipped({ checkoutId: 'x', shippingId: '', trackingCode: '' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('handleShippingCompleted', () => {
    it('should mark completed, save and return message', async () => {
      const event: ShippingCompletedEventDto = { checkoutId: 'chk-6', deliveredAt: 'now', shippingId: 'now' };
      const entity = {} as Checkout;
      repoMock.findOne.mockResolvedValue(entity);
      repoMock.save.mockResolvedValue(entity);

      const result = await service.handleShippingCompleted(event);
      expect(entity.status).toBe(CheckoutStatus.COMPLETED);
      expect(entity.shippingStatus).toBe(ShippingStatus.DELIVERED);
      expect(entity.closedAt).toBeInstanceOf(Date);
      expect(repoMock.save).toHaveBeenCalledWith(entity);
      expect(result).toBe('Shipping completed and checkout updated successfully');
    });

    it('should throw if checkout not found', async () => {
      repoMock.findOne.mockResolvedValue(null);
      await expect(service.handleShippingCompleted({ checkoutId: 'x', deliveredAt: '', shippingId: '' }))
        .rejects.toThrow(NotFoundException);
    });
  });
});
