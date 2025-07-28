import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateCheckoutDto } from 'src/dtos/create-checkout.dto';
import { PaymentResponseDto } from 'src/dtos/payment-response.dto';
import { ShipmentResponseDto } from 'src/dtos/shipment-response.dto';

@Injectable()
export class BffService {
    private readonly checkoutUrl: string;
    private readonly paymentUrl: string;
    private readonly shipmentUrl: string;

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
    ) {
        this.checkoutUrl = this.config.get<string>('CHECKOUT_SERVICE_URL') ?? "";
        this.paymentUrl = this.config.get<string>('PAYMENT_SERVICE_URL') ?? "";
        this.shipmentUrl = this.config.get<string>('SHIPPING_SERVICE_URL') ?? "";

        if (!this.checkoutUrl || !this.paymentUrl || !this.shipmentUrl) {
            throw new HttpException(
                'Microservice URL(s) not defined in env',
                500,
            );
        }
    }

    // TESTE
    async createCheckouts() {
        const ret = await firstValueFrom(
            this.http.get(`${this.checkoutUrl}/checkout`),
        ); 

        return ret.data;
    }

    async createCheckout(dto: CreateCheckoutDto) {
        const { data } = await firstValueFrom(
            this.http.post(`${this.checkoutUrl}/checkout`, dto),
        );
        return data;
    }

    async getCheckout(id: string) {
        const { data } = await firstValueFrom(
            this.http.get(`${this.checkoutUrl}/checkout/${id}`),
        );
        return data;
    }

    async getPayment(id: string): Promise<PaymentResponseDto> {
        const { data } = await firstValueFrom(
            this.http.get<PaymentResponseDto>(`${this.paymentUrl}/payments/${id}`),
        );
        return data;
    }

    async getShipment(id: string): Promise<ShipmentResponseDto> {
        const { data } = await firstValueFrom(
            this.http.get<ShipmentResponseDto>(`${this.shipmentUrl}/shipping/${id}`),
        );
        return data;
    }
}
