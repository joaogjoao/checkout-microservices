import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutController } from '../controllers/checkout.controller';
import { CheckoutService } from '../services/checkout.service';
import { CreateCheckoutDto } from '../domain/dtos/create-checkout.dto';
import { HttpException } from '@nestjs/common';
import { CreateCheckoutResponseDto } from '../domain/dtos/create-checkout-response.dto';
import { PaymentMethod } from '../domain/enums/payment-method.enum';
import { ShippingStatus } from '../domain/enums/shipping-status.enum';
import { PaymentStatus } from   '../domain/enums/payment-status.enum';
import { CheckoutStatus } from '../domain/enums/checkout-status.enum';
describe('CheckoutController', () => {
  let controller: CheckoutController;
  let service: CheckoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        {
          provide: CheckoutService,
          useValue: {
            createCheckout: jest.fn(),
            findById: jest.fn(),

          },
        },
      ],
    }).compile();

    controller = module.get<CheckoutController>(CheckoutController);
    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a checkout successfully', async () => {
      const dto: CreateCheckoutDto = {
        items: [{ productId: '1', quantity: 2, unitPrice: 50 }],
        total: 100.00,
        address: {
          street: "Rua das Palmeiras, 123",
          city: "São Paulo",
          state: "SP",
          zip: "01234-567",
          country: "Brasil"
        },
        payment: {
          paymentMethod: PaymentMethod.PIX,
          pixKey: "email@email.com"
        }
      };
      const response: CreateCheckoutResponseDto = {
        total: 100.00,
        id: '123',
        status: CheckoutStatus.CANCELLED
      };
      jest.spyOn(service,'createCheckout').mockResolvedValue(response);

      expect(await controller.create(dto)).toEqual(response);
    });

    it('should throw an error for invalid data', async () => {
      const dto: CreateCheckoutDto = {
        items: [{ productId: '1', quantity: 2, unitPrice: 50 }],
        total: 100.00,
        address: {
          street: "Rua das Palmeiras, 123",
          city: "São Paulo",
          state: "SP",
          zip: "01234-567",
          country: "Brasil"
        },
        payment: {
          paymentMethod: PaymentMethod.PIX,
        }
      };

      await expect(controller.create(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('find', () => {
    it('should return a checkout by id', async () => {
      const id = '123';
      const response = {
        id,
        total: 100,
        createdAt: new Date(),
        closedAt: null,
        paymentStatus: PaymentStatus.PENDING,
        shippingStatus: ShippingStatus.PENDING,
        status: CheckoutStatus.OPEN
      };
      jest.spyOn(service, 'findById').mockResolvedValue(response);

      expect(await controller.find(id)).toEqual(response);
    });
  });
});