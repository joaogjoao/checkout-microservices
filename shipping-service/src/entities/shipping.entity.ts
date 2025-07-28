import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Shipping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  checkoutId: string;

  @Column()
  orderId: string;

  @Column()
  status: string;

  @Column()
  trackingCode: string;

  @Column({ type: 'timestamp with time zone' })
  shippedAt: Date;
}
