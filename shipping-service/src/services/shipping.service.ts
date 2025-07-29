import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Shipping } from '../entities/shipping.entity';
import { ShippingCompletedMessageDto } from '../dtos/shipping-completed-message.dto';
import { CheckoutPaidEventDto } from 'src/dtos/checkout-paid-event.dto';
import { ShippingCreatedMessageDto } from 'src/dtos/shipping-created-message.dto';
import { ShippingStatus } from 'src/enums/shipping-status.enum';

@Injectable()
export class ShippingService implements OnModuleInit {
    constructor(
        @InjectRepository(Shipping) private repo: Repository<Shipping>,
        @Inject('KAFKA_SERVICE') private client: ClientKafka,
    ) { }

    async onModuleInit() {
        await this.client.connect();
    }

    async createShipping(checkout: CheckoutPaidEventDto): Promise<void> {
        const shipping: Shipping = this.createShippingFromCheckout(checkout);
        let saved = await this.repo.save(shipping);

        await this.emitShippingCreated(saved);
    }

    async completeShipping(shippingId: string): Promise<string> {
        const shipping = await this.repo.findOneBy({ id: shippingId });
        if (!shipping) {
            throw new Error('Shipping not found');
        }
        shipping.deliveredAt = new Date();
        shipping.status = ShippingStatus.DELIVERED;
        await this.repo.save(shipping);
        await this.emitShippingCompleted(shipping);
        return "Shipping completed successfully";
    }

    private createShippingFromCheckout(checkout: CheckoutPaidEventDto): Shipping {
        const shipping: Shipping = this.repo.create({
            checkoutId: checkout.id,
            trackingCode: this.generateTrackingCode(),
            address: { ...checkout.address },
            shippedAt: new Date(),
        });
        return shipping;
    }

    private async emitShippingCreated(shipping: Shipping) {
        const event: ShippingCreatedMessageDto = {
            checkoutId: shipping.checkoutId,
            shippingId: shipping.id,
            trackingCode: shipping.trackingCode,
        };

        this.client.emit('shipping.created', event);
    }

    private async emitShippingCompleted(shipping: Shipping) {
        const event: ShippingCompletedMessageDto = {
            checkoutId: shipping.checkoutId,
            shippingId: shipping.id,
            deliveredAt: new Date().toISOString(),
        };

        this.client.emit('shipping.completed', event);
    }

    private generateTrackingCode(): string {
        return Math.random().toString(36).slice(2, 8).toUpperCase();
    }
}
