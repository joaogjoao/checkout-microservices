import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { Shipping } from '../entities/shipping.entity';
import { ShippingCompletedEventDto } from '../dtos/shipping-completed-event.dto';

@Injectable()
export class ShippingService implements OnModuleInit {
    constructor(
        @InjectRepository(Shipping) private repo: Repository<Shipping>,
        @Inject('KAFKA_SERVICE') private client: ClientKafka,
    ) { }

    async onModuleInit() {
        await this.client.connect();
    }

    /**
     * Cria um registro de shipping usando o paymentId como orderId
     */
    async createShipping(
        checkoutId: string,
        paymentId: string,
    ): Promise<Shipping> {
        const shipping = this.repo.create({
            checkoutId,
            orderId: paymentId,       // aqui mapeamos paymentId → orderId na entidade
            status: 'SHIPPED',
            trackingCode: this.generateTrackingCode(),
            shippedAt: new Date(),
        });
        let saved = await this.repo.save(shipping);
        await this.emitShippingCompleted(saved);
        return saved;
    }

    async emitShippingCompleted(shipping: Shipping) {
        const event: ShippingCompletedEventDto = {
            checkoutId: shipping.checkoutId,
            shipmentId: shipping.id,
            trackingCode: shipping.trackingCode,
            deliveredAt: new Date().toISOString(),
        };
        this.client.emit('shipping.completed', event);
    }

    private generateTrackingCode(): string {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }
}
