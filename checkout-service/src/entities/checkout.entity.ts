import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum CheckoutStatus {
  OPEN = 'OPEN',
  PAYMENT_REJECTED = 'PAYMENT_REJECTED',
  COMPLETED = 'COMPLETED'
}

@Entity()
export class Checkout {
  @PrimaryColumn()
  id: string;

  @Column('text', { array: true })
  items: string[];

  @Column('decimal')
  total: number;

  @Column()
  address: string;

  @Column({
    type: 'enum',
    enum: CheckoutStatus,
    default: CheckoutStatus.OPEN,
  })
  status: CheckoutStatus;

  @Column({ nullable: true })
  paymentReason: string;

  @Column({ nullable: true })
  trackingCode: string;
}
