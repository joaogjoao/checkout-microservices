import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Address } from './address.entity';
import { ShippingStatus } from 'src/enums/shipping-status.enum';

@Entity()
export class Shipping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  checkoutId: string;

  @Column({ type: 'enum', enum: ShippingStatus, default: ShippingStatus.PENDING })
  status: ShippingStatus;

  @Column()
  trackingCode: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  shippedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deliveredAt: Date;
  
  @OneToOne(() => Address, (address) => address.shipping, { cascade: true })
  @JoinColumn()
  address: Address;
}
