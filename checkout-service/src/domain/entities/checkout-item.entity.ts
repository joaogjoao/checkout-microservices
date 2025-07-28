import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Checkout } from './checkout.entity';

@Entity('checkout_item')
export class CheckoutItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Checkout, (checkout) => checkout.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'checkout_id' })
  checkout: Checkout;

  @Column('uuid')
  checkout_id: string;

  @Column()
  productId: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;
}