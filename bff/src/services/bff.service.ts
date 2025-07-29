import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateCheckoutDto } from 'src/dtos/create-checkout.dto';
import { CreateCheckoutResponseDto } from 'src/dtos/create-checkout-response.dto';
import { CheckoutResponseDto } from 'src/dtos/checkout-response.dto';

@Injectable()
export class BffService {

    private readonly checkoutUrl: string;
    private readonly shippingUrl: string;

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
    ) {
        this.checkoutUrl = this.config.get<string>('CHECKOUT_SERVICE_URL') ?? "";
        this.shippingUrl = this.config.get<string>('SHIPPING_SERVICE_URL') ?? "";

        if (!this.checkoutUrl || !this.shippingUrl) {
            throw new HttpException(
                'Microservice URL(s) not defined in env',
                500,
            );
        }
    }

    async createCheckout(dto: CreateCheckoutDto): Promise<CreateCheckoutResponseDto | null> {
        try {
            const { data } = await firstValueFrom(
                this.http.post(`${this.checkoutUrl}/checkout`, dto),
            );
            return {
                id: data.id,
                status: data.status,
                total: data.total
            };
        } catch (error) {
            console.error('Error creating checkout:', error)
            return null;
        }
    }

    async getCheckout(id: string): Promise<CheckoutResponseDto | null> {
        try {
            const { data } = await firstValueFrom(
                this.http.get<CheckoutResponseDto>(`${this.checkoutUrl}/checkout/${id}`),
            );
            return data;
        } catch (error) {
            console.error('Error fetching checkout:', error);
            return null;
        }
    }

    async completeShipping(id: string): Promise<boolean> {
        const { data } = await firstValueFrom(
            this.http.post<boolean>(`${this.shippingUrl}/shipping/${id}/complete`, {}),
        );
        return data;
    }
}
