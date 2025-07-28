import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { CheckoutItem } from './checkout-item.entity';
import { Address } from './address.entity';
import { CheckoutStatus } from '../enums/checkout-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { ShippingStatus } from '../enums/shipping-status.enum';

@Entity('checkout')
export class Checkout extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CheckoutStatus, default: CheckoutStatus.OPEN })
  status: CheckoutStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @OneToMany(() => CheckoutItem, (item) => item.checkout, { cascade: true })
  items: CheckoutItem[];

  @OneToOne(() => Address, (address) => address.checkout, { cascade: true })
  @JoinColumn()
  address: Address;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'enum', enum: ShippingStatus, default: ShippingStatus.PENDING })
  shippingStatus: ShippingStatus;

  @Column({ type: 'text', nullable: true })
  paymentFailureReason?: string;

  @Column({ type: 'text', nullable: true })
  shippingId?: string;

  @Column({ type: 'text', nullable: true })
  trackingCode?: string;
}
